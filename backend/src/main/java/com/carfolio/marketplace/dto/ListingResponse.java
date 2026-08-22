package com.carfolio.marketplace.dto;

import com.carfolio.car.Condition;
import com.carfolio.marketplace.Listing;
import com.carfolio.marketplace.ListingStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ListingResponse(
        UUID id,
        UUID sellerId,
        String sellerUsername,
        String sellerName,
        ListingCarSummary car,
        BigDecimal price,
        Condition condition,
        String description,
        String shippingInfo,
        ListingStatus status,
        BigDecimal purchasePriceAtListing,
        BigDecimal soldPrice,
        BigDecimal profit,
        Instant soldAt,
        Instant createdAt,
        List<ListingPhotoResponse> photos
) {
    public static ListingResponse from(Listing listing) {
        BigDecimal profit = listing.getSoldPrice() != null && listing.getPurchasePriceAtListing() != null
                ? listing.getSoldPrice().subtract(listing.getPurchasePriceAtListing())
                : null;
        return new ListingResponse(
                listing.getId(),
                listing.getUser().getId(),
                listing.getUser().getUsername(),
                listing.getUser().getName(),
                ListingCarSummary.from(listing.getCar()),
                listing.getPrice(),
                listing.getCondition(),
                listing.getDescription(),
                listing.getShippingInfo(),
                listing.getStatus(),
                listing.getPurchasePriceAtListing(),
                listing.getSoldPrice(),
                profit,
                listing.getSoldAt(),
                listing.getCreatedAt(),
                listing.getPhotos().stream().map(ListingPhotoResponse::from).toList()
        );
    }
}
