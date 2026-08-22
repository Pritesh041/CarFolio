package com.carfolio.trade.dto;

import com.carfolio.trade.Trade;
import com.carfolio.trade.TradeItem;
import com.carfolio.trade.TradeStatus;
import com.carfolio.user.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TradeResponse(
        UUID id,
        Party initiator,
        Party recipient,
        TradeStatus status,
        List<TradeItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {
    public record Party(UUID id, String username, String name) {
        static Party from(User user) {
            return new Party(user.getId(), user.getUsername(), user.getName());
        }
    }

    public static TradeResponse from(Trade trade, List<TradeItem> items) {
        return new TradeResponse(
                trade.getId(),
                Party.from(trade.getInitiator()),
                Party.from(trade.getRecipient()),
                trade.getStatus(),
                items.stream().map(TradeItemResponse::from).toList(),
                trade.getCreatedAt(),
                trade.getUpdatedAt()
        );
    }
}
