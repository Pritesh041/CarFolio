package com.carfolio.collection.dto;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.car.Car;
import com.carfolio.car.Condition;
import com.carfolio.car.PackagingCondition;
import com.carfolio.car.dto.CarPhotoResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ShowcaseCarResponse(
        UUID id,
        BrandResponse brand,
        String model,
        String variant,
        String series,
        Integer year,
        String scale,
        String color,
        Condition condition,
        PackagingCondition packagingCondition,
        BigDecimal purchasePrice,
        BigDecimal estimatedValue,
        List<CarPhotoResponse> photos
) {
    public static ShowcaseCarResponse from(Car car, boolean hidePurchasePrices, boolean showEstimatedValues) {
        return new ShowcaseCarResponse(
                car.getId(),
                BrandResponse.from(car.getBrand()),
                car.getModel(),
                car.getVariant(),
                car.getSeries(),
                car.getYear(),
                car.getScale(),
                car.getColor(),
                car.getCondition(),
                car.getPackagingCondition(),
                hidePurchasePrices ? null : car.getPurchasePrice(),
                showEstimatedValues ? car.getEstimatedValue() : null,
                car.getPhotos().stream().map(CarPhotoResponse::from).toList()
        );
    }
}
