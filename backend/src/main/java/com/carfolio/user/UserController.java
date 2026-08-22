package com.carfolio.user;

import com.carfolio.analytics.AnalyticsService;
import com.carfolio.analytics.dto.SummaryResponse;
import com.carfolio.car.CarRepository;
import com.carfolio.car.PhotoStorageService;
import com.carfolio.collection.CollectionRepository;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.security.UserPrincipal;
import com.carfolio.social.FollowService;
import com.carfolio.user.dto.ProfileResponse;
import com.carfolio.user.dto.ProfileUpdateRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserRepository userRepository;
    private final AnalyticsService analyticsService;
    private final CollectionRepository collectionRepository;
    private final CarRepository carRepository;
    private final FollowService followService;
    private final PhotoStorageService photoStorageService;

    public UserController(UserRepository userRepository, AnalyticsService analyticsService,
                           CollectionRepository collectionRepository, CarRepository carRepository,
                           FollowService followService, PhotoStorageService photoStorageService) {
        this.userRepository = userRepository;
        this.analyticsService = analyticsService;
        this.collectionRepository = collectionRepository;
        this.carRepository = carRepository;
        this.followService = followService;
        this.photoStorageService = photoStorageService;
    }

    @GetMapping("/{username}")
    public ProfileResponse getPublicProfile(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        boolean isFollowing = principal != null && followService.isFollowing(principal.getId(), user.getId());
        return toProfile(user, isFollowing);
    }

    @PatchMapping("/me")
    public ProfileResponse updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestBody ProfileUpdateRequest request) {
        User user = principal.getUser();
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        if (request.location() != null) {
            user.setLocation(request.location());
        }
        if (request.website() != null) {
            user.setWebsite(request.website());
        }
        userRepository.save(user);
        return toProfile(user, false);
    }

    @PostMapping("/me/avatar")
    public ProfileResponse uploadAvatar(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestParam("file") MultipartFile file) {
        User user = principal.getUser();
        user.setAvatarUrl(photoStorageService.store(file));
        userRepository.save(user);
        return toProfile(user, false);
    }

    @GetMapping("/me/stats")
    public SummaryResponse myStats(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.summary(principal.getId());
    }

    private ProfileResponse toProfile(User user, boolean isFollowing) {
        var publicCollections = collectionRepository.findByUserIdAndPublishedTrueOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(c -> new ProfileResponse.PublicCollectionSummary(c.getShareSlug(), c.getName(), c.getCoverImageUrl()))
                .toList();
        var favoriteBrands = carRepository.findFavoriteBrandNames(user.getId(), PageRequest.of(0, 3));
        return new ProfileResponse(user.getId(), user.getName(), user.getUsername(), user.getAvatarUrl(), user.getBio(),
                user.getLocation(), user.getWebsite(), user.getCreatedAt(),
                publicCollections, favoriteBrands,
                followService.followersCount(user.getId()), followService.followingCount(user.getId()), isFollowing);
    }
}
