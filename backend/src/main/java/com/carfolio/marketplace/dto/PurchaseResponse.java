package com.carfolio.marketplace.dto;

import com.carfolio.marketplace.Listing;
import com.carfolio.marketplace.Offer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record PurchaseResponse(
        UUID offerId,
        UUID listingId,
        ListingCarSummary car,
        List<ListingPhotoResponse> photos,
        BigDecimal amount,
        String sellerUsername,
        String sellerName,
        Instant purchasedAt
) {
    public static PurchaseResponse from(Offer offer) {
        Listing listing = offer.getListing();
        return new PurchaseResponse(
                offer.getId(),
                listing.getId(),
                ListingCarSummary.from(listing.getCar()),
                listing.getPhotos().stream().map(ListingPhotoResponse::from).toList(),
                offer.getAmount(),
                listing.getUser().getUsername(),
                listing.getUser().getName(),
                offer.getUpdatedAt()
        );
    }
}
