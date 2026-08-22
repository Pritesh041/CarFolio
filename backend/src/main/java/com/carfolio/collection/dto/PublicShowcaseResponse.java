package com.carfolio.collection.dto;

import com.carfolio.collection.Collection;
import com.carfolio.user.User;

import java.util.List;
import java.util.UUID;

public record PublicShowcaseResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        Owner owner,
        List<ShowcaseCarResponse> cars
) {
    public record Owner(String username, String name, String avatarUrl) {}

    public static PublicShowcaseResponse from(Collection collection) {
        List<ShowcaseCarResponse> cars = collection.getCars().stream()
                .map(cc -> ShowcaseCarResponse.from(cc.getCar(), collection.isHidePurchasePrices(), collection.isShowEstimatedValues()))
                .toList();
        User owner = collection.getUser();
        return new PublicShowcaseResponse(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                collection.getCoverImageUrl(),
                new Owner(owner.getUsername(), owner.getName(), owner.getAvatarUrl()),
                cars
        );
    }
}
