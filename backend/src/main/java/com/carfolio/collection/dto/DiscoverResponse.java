package com.carfolio.collection.dto;

import com.carfolio.collection.Collection;
import com.carfolio.marketplace.dto.ListingResponse;

import java.util.List;

public record DiscoverResponse(
        List<ShowcaseSummary> showcases,
        List<ListingResponse> listings
) {
    public record ShowcaseSummary(String username, String slug, String name, String coverImageUrl, String ownerName) {
        public static ShowcaseSummary from(Collection collection) {
            return new ShowcaseSummary(
                    collection.getUser().getUsername(),
                    collection.getShareSlug(),
                    collection.getName(),
                    collection.getCoverImageUrl(),
                    collection.getUser().getName()
            );
        }
    }
}
