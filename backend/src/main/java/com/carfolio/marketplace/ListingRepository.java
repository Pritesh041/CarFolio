package com.carfolio.marketplace;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, UUID>, JpaSpecificationExecutor<Listing> {

    List<Listing> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Listing> findTop12ByStatusOrderByCreatedAtDesc(ListingStatus status);

    List<Listing> findByUserIdInAndStatusOrderByCreatedAtDesc(List<UUID> userIds, ListingStatus status);
}
