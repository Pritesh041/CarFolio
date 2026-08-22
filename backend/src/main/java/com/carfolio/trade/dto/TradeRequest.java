package com.carfolio.trade.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record TradeRequest(
        @NotBlank String recipientUsername,
        @NotNull UUID requestedCarId,
        @NotEmpty List<UUID> offeredCarIds,
        String message
) {}
