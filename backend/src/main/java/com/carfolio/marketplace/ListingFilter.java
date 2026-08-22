package com.carfolio.marketplace;

import com.carfolio.car.Condition;

import java.math.BigDecimal;
import java.util.UUID;

public record ListingFilter(
        UUID brandId,
        String scale,
        Condition condition,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String q
) {}
