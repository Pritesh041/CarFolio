package com.carfolio.pricing.dto;

import java.math.BigDecimal;

public record MarketPriceResponse(
        boolean found,
        BigDecimal estimatedValue,
        String currency,
        String source,
        String message
) {
    public static MarketPriceResponse notFound(String message) {
        return new MarketPriceResponse(false, null, null, "AI_ESTIMATE", message);
    }

    public static MarketPriceResponse of(BigDecimal estimatedValue, String currency) {
        return new MarketPriceResponse(true, estimatedValue, currency, "AI_ESTIMATE", null);
    }
}
