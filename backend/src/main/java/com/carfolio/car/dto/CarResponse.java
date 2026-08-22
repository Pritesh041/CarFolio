package com.carfolio.car.dto;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.car.Car;
import com.carfolio.car.Condition;
import com.carfolio.car.HotWheelsSeriesType;
import com.carfolio.car.HuntType;
import com.carfolio.car.PackagingCondition;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CarResponse(
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
        HotWheelsSeriesType hotWheelsSeriesType,
        HuntType huntType,
        BigDecimal purchasePrice,
        LocalDate purchaseDate,
        BigDecimal estimatedValue,
        Integer quantity,
        String notes,
        List<CarPhotoResponse> photos
) {
    public static CarResponse from(Car car) {
        return new CarResponse(
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
                car.getHotWheelsSeriesType(),
                car.getHuntType(),
                car.getPurchasePrice(),
                car.getPurchaseDate(),
                car.getEstimatedValue(),
                car.getQuantity(),
                car.getNotes(),
                car.getPhotos().stream().map(CarPhotoResponse::from).toList()
        );
    }
}
