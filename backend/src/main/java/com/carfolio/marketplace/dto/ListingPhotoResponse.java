package com.carfolio.marketplace.dto;

import com.carfolio.marketplace.ListingPhoto;

import java.util.UUID;

public record ListingPhotoResponse(UUID id, String url, int position, boolean isPrimary) {
    public static ListingPhotoResponse from(ListingPhoto photo) {
        return new ListingPhotoResponse(photo.getId(), photo.getUrl(), photo.getPosition(), photo.isPrimary());
    }
}
