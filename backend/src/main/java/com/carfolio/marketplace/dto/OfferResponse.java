package com.carfolio.marketplace.dto;

import com.carfolio.marketplace.Offer;
import com.carfolio.marketplace.OfferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record OfferResponse(
        UUID id,
        UUID listingId,
        UUID buyerId,
        String buyerUsername,
        String buyerName,
        BigDecimal amount,
        String message,
        OfferStatus status,
        Instant createdAt
) {
    public static OfferResponse from(Offer offer) {
        return new OfferResponse(
                offer.getId(),
                offer.getListing().getId(),
                offer.getBuyer().getId(),
                offer.getBuyer().getUsername(),
                offer.getBuyer().getName(),
                offer.getAmount(),
                offer.getMessage(),
                offer.getStatus(),
                offer.getCreatedAt()
        );
    }
}
