package com.carfolio.collection.dto;

import jakarta.validation.constraints.NotBlank;

public record CollectionRequest(
        @NotBlank String name,
        String description,
        String coverImageUrl,
        Boolean hidePurchasePrices,
        Boolean showEstimatedValues
) {}
