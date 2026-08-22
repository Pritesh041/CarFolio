package com.carfolio.collection;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class CollectionCarId implements Serializable {

    private UUID collectionId;
    private UUID carId;

    public CollectionCarId() {}

    public CollectionCarId(UUID collectionId, UUID carId) {
        this.collectionId = collectionId;
        this.carId = carId;
    }

    public UUID getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(UUID collectionId) {
        this.collectionId = collectionId;
    }

    public UUID getCarId() {
        return carId;
    }

    public void setCarId(UUID carId) {
        this.carId = carId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CollectionCarId that)) return false;
        return Objects.equals(collectionId, that.collectionId) && Objects.equals(carId, that.carId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(collectionId, carId);
    }
}
