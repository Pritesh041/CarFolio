package com.carfolio.trade.dto;

import com.carfolio.trade.TradeStatus;
import jakarta.validation.constraints.NotNull;

public record TradeStatusUpdateRequest(@NotNull TradeStatus status) {}
