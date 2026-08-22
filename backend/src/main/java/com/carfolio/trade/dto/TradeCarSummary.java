package com.carfolio.trade.dto;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.car.Car;
import com.carfolio.car.CarPhoto;

import java.util.UUID;

public record TradeCarSummary(
        UUID id,
        BrandResponse brand,
        String model,
        String variant,
        String series,
        Integer year,
        String scale,
        String color,
        String primaryPhotoUrl
) {
    public static TradeCarSummary from(Car car) {
        String primaryPhotoUrl = car.getPhotos().stream()
                .filter(CarPhoto::isPrimary)
                .findFirst()
                .or(() -> car.getPhotos().stream().findFirst())
                .map(CarPhoto::getUrl)
                .orElse(null);
        return new TradeCarSummary(
                car.getId(),
                BrandResponse.from(car.getBrand()),
                car.getModel(),
                car.getVariant(),
                car.getSeries(),
                car.getYear(),
                car.getScale(),
                car.getColor(),
                primaryPhotoUrl
        );
    }
}
