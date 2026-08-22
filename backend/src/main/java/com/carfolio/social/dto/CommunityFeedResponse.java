package com.carfolio.social.dto;

import com.carfolio.collection.dto.DiscoverResponse;
import com.carfolio.marketplace.dto.ListingResponse;

import java.util.List;

public record CommunityFeedResponse(
        List<DiscoverResponse.ShowcaseSummary> showcases,
        List<ListingResponse> listings,
        long followingCount
) {
}
