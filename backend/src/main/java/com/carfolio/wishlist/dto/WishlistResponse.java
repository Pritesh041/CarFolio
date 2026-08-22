package com.carfolio.wishlist.dto;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.wishlist.Priority;
import com.carfolio.wishlist.WishlistItem;

import java.math.BigDecimal;
import java.util.UUID;

public record WishlistResponse(
        UUID id,
        BrandResponse brand,
        String model,
        String variant,
        String series,
        String scale,
        Integer year,
        BigDecimal targetPrice,
        Priority priority,
        boolean notifyOnAvailable,
        boolean notifyOnPriceDrop
) {
    public static WishlistResponse from(WishlistItem item) {
        return new WishlistResponse(
                item.getId(),
                item.getBrand() != null ? BrandResponse.from(item.getBrand()) : null,
                item.getModel(),
                item.getVariant(),
                item.getSeries(),
                item.getScale(),
                item.getYear(),
                item.getTargetPrice(),
                item.getPriority(),
                item.isNotifyOnAvailable(),
                item.isNotifyOnPriceDrop()
        );
    }
}
