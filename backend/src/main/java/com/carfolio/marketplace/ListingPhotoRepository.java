package com.carfolio.marketplace;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ListingPhotoRepository extends JpaRepository<ListingPhoto, UUID> {
}
