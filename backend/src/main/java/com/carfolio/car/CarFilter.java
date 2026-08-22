package com.carfolio.car;

import java.math.BigDecimal;
import java.util.UUID;

public record CarFilter(
        UUID brandId,
        String model,
        Integer year,
        String series,
        String scale,
        String color,
        Condition condition,
        PackagingCondition packagingCondition,
        BigDecimal minPurchasePrice,
        BigDecimal maxPurchasePrice,
        BigDecimal minValue,
        BigDecimal maxValue,
        String q
) {}
