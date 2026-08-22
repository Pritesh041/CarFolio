package com.carfolio.marketplace.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record OfferRequest(@NotNull @Positive BigDecimal amount, String message) {}
