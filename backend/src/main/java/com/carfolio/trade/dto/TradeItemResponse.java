package com.carfolio.trade.dto;

import com.carfolio.trade.TradeItem;

import java.math.BigDecimal;
import java.util.UUID;

public record TradeItemResponse(
        UUID id,
        TradeCarSummary car,
        UUID offeredByUserId,
        BigDecimal estimatedValueAtTrade
) {
    public static TradeItemResponse from(TradeItem item) {
        return new TradeItemResponse(
                item.getId(),
                TradeCarSummary.from(item.getCar()),
                item.getOfferedBy().getId(),
                item.getEstimatedValueAtTrade()
        );
    }
}
