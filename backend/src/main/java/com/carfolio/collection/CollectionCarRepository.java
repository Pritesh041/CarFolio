package com.carfolio.collection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CollectionCarRepository extends JpaRepository<CollectionCar, CollectionCarId> {

    void deleteByCarId(UUID carId);
}
