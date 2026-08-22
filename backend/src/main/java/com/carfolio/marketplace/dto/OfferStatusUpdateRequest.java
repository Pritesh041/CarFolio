package com.carfolio.marketplace.dto;

import com.carfolio.marketplace.OfferStatus;
import jakarta.validation.constraints.NotNull;

public record OfferStatusUpdateRequest(@NotNull OfferStatus status) {}
