package com.carfolio.marketplace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfferRepository extends JpaRepository<Offer, UUID> {

    List<Offer> findByListingIdOrderByCreatedAtDesc(UUID listingId);

    List<Offer> findByBuyerIdAndStatusOrderByUpdatedAtDesc(UUID buyerId, OfferStatus status);
}
