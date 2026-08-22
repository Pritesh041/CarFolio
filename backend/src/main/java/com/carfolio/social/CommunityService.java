package com.carfolio.social;

import com.carfolio.collection.CollectionRepository;
import com.carfolio.collection.dto.DiscoverResponse;
import com.carfolio.marketplace.ListingRepository;
import com.carfolio.marketplace.ListingStatus;
import com.carfolio.marketplace.dto.ListingResponse;
import com.carfolio.social.dto.CommunityFeedResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CommunityService {

    private final FollowRepository followRepository;
    private final CollectionRepository collectionRepository;
    private final ListingRepository listingRepository;

    public CommunityService(FollowRepository followRepository,
                             CollectionRepository collectionRepository,
                             ListingRepository listingRepository) {
        this.followRepository = followRepository;
        this.collectionRepository = collectionRepository;
        this.listingRepository = listingRepository;
    }

    @Transactional(readOnly = true)
    public CommunityFeedResponse feed(UUID userId) {
        List<UUID> followingIds = followRepository.findFollowingIds(userId);
        if (followingIds.isEmpty()) {
            return new CommunityFeedResponse(List.of(), List.of(), 0);
        }

        List<DiscoverResponse.ShowcaseSummary> showcases = collectionRepository
                .findByUserIdInAndPublishedTrueOrderByUpdatedAtDesc(followingIds)
                .stream().map(DiscoverResponse.ShowcaseSummary::from).toList();

        List<ListingResponse> listings = listingRepository
                .findByUserIdInAndStatusOrderByCreatedAtDesc(followingIds, ListingStatus.ACTIVE)
                .stream().map(ListingResponse::from).toList();

        return new CommunityFeedResponse(showcases, listings, followingIds.size());
    }
}
