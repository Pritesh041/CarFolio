package com.carfolio.social;

import com.carfolio.common.exception.ConflictException;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.user.User;
import com.carfolio.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void follow(User follower, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        if (following.getId().equals(follower.getId())) {
            throw new ConflictException("CANNOT_FOLLOW_SELF", "You can't follow yourself");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), following.getId())) {
            return;
        }
        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(following);
        followRepository.save(follow);
    }

    @Transactional
    public void unfollow(User follower, String followingUsername) {
        User following = userRepository.findByUsername(followingUsername)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        followRepository.findByFollowerIdAndFollowingId(follower.getId(), following.getId())
                .ifPresent(followRepository::delete);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(UUID followerId, UUID followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Transactional(readOnly = true)
    public long followersCount(UUID userId) {
        return followRepository.countByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public long followingCount(UUID userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Transactional(readOnly = true)
    public List<UUID> followingIds(UUID userId) {
        return followRepository.findFollowingIds(userId);
    }
}
