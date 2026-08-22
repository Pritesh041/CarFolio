package com.carfolio.car;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CarPhotoRepository extends JpaRepository<CarPhoto, UUID> {
}
