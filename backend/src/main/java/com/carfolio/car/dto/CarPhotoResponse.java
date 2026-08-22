package com.carfolio.car.dto;

import com.carfolio.car.CarPhoto;

import java.util.UUID;

public record CarPhotoResponse(UUID id, String url, int position, boolean isPrimary) {

    public static CarPhotoResponse from(CarPhoto photo) {
        return new CarPhotoResponse(photo.getId(), photo.getUrl(), photo.getPosition(), photo.isPrimary());
    }
}
