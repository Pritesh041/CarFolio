package com.carfolio.trade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TradeItemRepository extends JpaRepository<TradeItem, UUID> {

    List<TradeItem> findByTradeId(UUID tradeId);
}
