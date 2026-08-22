package com.carfolio.analytics.dto;

import java.math.BigDecimal;

public record SummaryResponse(
        long totalModels,
        BigDecimal collectionValue,
        BigDecimal totalInvested,
        BigDecimal estimatedGain,
        BigDecimal growthPercent
) {}
