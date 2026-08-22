package com.carfolio.user.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        String name,
        String username,
        String avatarUrl,
        String bio,
        String location,
        String website,
        Instant joinedAt,
        List<PublicCollectionSummary> publicCollections,
        List<String> favoriteBrands,
        long followersCount,
        long followingCount,
        boolean isFollowing
) {
    public record PublicCollectionSummary(String slug, String name, String coverImageUrl) {}
}
