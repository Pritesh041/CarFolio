package com.carfolio.wishlist.dto;

import com.carfolio.wishlist.Priority;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.UUID;

public record WishlistRequest(
        UUID brandId,
        @NotBlank String model,
        String variant,
        String series,
        String scale,
        Integer year,
        BigDecimal targetPrice,
        Priority priority,
        Boolean notifyOnAvailable,
        Boolean notifyOnPriceDrop
) {}
