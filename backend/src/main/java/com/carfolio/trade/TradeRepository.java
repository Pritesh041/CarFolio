package com.carfolio.trade;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TradeRepository extends JpaRepository<Trade, UUID> {

    List<Trade> findByInitiatorIdOrRecipientIdOrderByCreatedAtDesc(UUID initiatorId, UUID recipientId);
}
