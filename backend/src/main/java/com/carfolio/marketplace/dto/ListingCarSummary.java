package com.carfolio.marketplace.dto;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.car.Car;

import java.util.UUID;

public record ListingCarSummary(
        UUID id,
        BrandResponse brand,
        String model,
        String variant,
        String series,
        Integer year,
        String scale,
        String color
) {
    public static ListingCarSummary from(Car car) {
        return new ListingCarSummary(
                car.getId(),
                BrandResponse.from(car.getBrand()),
                car.getModel(),
                car.getVariant(),
                car.getSeries(),
                car.getYear(),
                car.getScale(),
                car.getColor()
        );
    }
}
