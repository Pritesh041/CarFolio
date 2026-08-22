package com.carfolio.brand.dto;

import com.carfolio.brand.Brand;

import java.util.UUID;

public record BrandResponse(UUID id, String name, String slug, String logoUrl, String country) {

    public static BrandResponse from(Brand brand) {
        return new BrandResponse(brand.getId(), brand.getName(), brand.getSlug(), brand.getLogoUrl(), brand.getCountry());
    }
}
