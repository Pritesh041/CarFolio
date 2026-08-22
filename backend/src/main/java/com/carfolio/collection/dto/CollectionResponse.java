package com.carfolio.collection.dto;

import com.carfolio.car.dto.CarResponse;
import com.carfolio.collection.Collection;
import com.carfolio.collection.CollectionCar;

import java.util.List;
import java.util.UUID;

public record CollectionResponse(
        UUID id,
        String name,
        String description,
        String coverImageUrl,
        boolean isPublic,
        boolean hidePurchasePrices,
        boolean showEstimatedValues,
        String shareSlug,
        List<CollectionCarResponse> cars
) {
    public record CollectionCarResponse(UUID carId, int position, CarResponse car) {
        public static CollectionCarResponse from(CollectionCar cc) {
            return new CollectionCarResponse(cc.getCar().getId(), cc.getPosition(), CarResponse.from(cc.getCar()));
        }
    }

    public static CollectionResponse from(Collection collection) {
        return new CollectionResponse(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                collection.getCoverImageUrl(),
                collection.isPublished(),
                collection.isHidePurchasePrices(),
                collection.isShowEstimatedValues(),
                collection.getShareSlug(),
                collection.getCars().stream().map(CollectionCarResponse::from).toList()
        );
    }
}
