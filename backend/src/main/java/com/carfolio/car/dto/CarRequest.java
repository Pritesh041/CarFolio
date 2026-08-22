package com.carfolio.car.dto;

import com.carfolio.car.Condition;
import com.carfolio.car.HotWheelsSeriesType;
import com.carfolio.car.HuntType;
import com.carfolio.car.PackagingCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CarRequest(
        @NotNull UUID brandId,
        @NotBlank String model,
        String variant,
        String series,
        Integer year,
        String scale,
        String color,
        @NotNull Condition condition,
        @NotNull PackagingCondition packagingCondition,
        HotWheelsSeriesType hotWheelsSeriesType,
        HuntType huntType,
        @NotNull @PositiveOrZero BigDecimal purchasePrice,
        LocalDate purchaseDate,
        @NotNull @PositiveOrZero BigDecimal estimatedValue,
        Integer quantity,
        String notes
) {}
