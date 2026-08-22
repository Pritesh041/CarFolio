package com.carfolio.marketplace.dto;

import com.carfolio.car.Condition;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record ListingRequest(
        @NotNull UUID carId,
        @NotNull @Positive BigDecimal price,
        @NotNull Condition condition,
        String description,
        String shippingInfo
) {}
