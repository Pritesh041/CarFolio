package com.carfolio.wishlist;

import com.carfolio.brand.Brand;
import com.carfolio.brand.BrandRepository;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.user.User;
import com.carfolio.wishlist.dto.WishlistRequest;
import com.carfolio.wishlist.dto.WishlistResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final BrandRepository brandRepository;

    public WishlistService(WishlistRepository wishlistRepository, BrandRepository brandRepository) {
        this.wishlistRepository = wishlistRepository;
        this.brandRepository = brandRepository;
    }

    public List<WishlistResponse> list(UUID userId) {
        return wishlistRepository.findByUserIdOrderByPriorityDescCreatedAtDesc(userId)
                .stream().map(WishlistResponse::from).toList();
    }

    @Transactional
    public WishlistResponse create(User user, WishlistRequest request) {
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        applyRequest(item, request);
        item = wishlistRepository.save(item);
        return WishlistResponse.from(item);
    }

    @Transactional
    public WishlistResponse update(UUID userId, UUID id, WishlistRequest request) {
        WishlistItem item = findOwned(userId, id);
        applyRequest(item, request);
        return WishlistResponse.from(item);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        wishlistRepository.delete(findOwned(userId, id));
    }

    private WishlistItem findOwned(UUID userId, UUID id) {
        WishlistItem item = wishlistRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("WISHLIST_ITEM_NOT_FOUND", "Wishlist item not found"));
        if (!item.getUser().getId().equals(userId)) {
            throw new NotFoundException("WISHLIST_ITEM_NOT_FOUND", "Wishlist item not found");
        }
        return item;
    }

    private void applyRequest(WishlistItem item, WishlistRequest request) {
        if (request.brandId() != null) {
            Brand brand = brandRepository.findById(request.brandId())
                    .orElseThrow(() -> new NotFoundException("BRAND_NOT_FOUND", "Brand not found"));
            item.setBrand(brand);
        }
        item.setModel(request.model());
        item.setVariant(request.variant());
        item.setSeries(request.series());
        item.setScale(request.scale());
        item.setYear(request.year());
        item.setTargetPrice(request.targetPrice());
        if (request.priority() != null) {
            item.setPriority(request.priority());
        }
        if (request.notifyOnAvailable() != null) {
            item.setNotifyOnAvailable(request.notifyOnAvailable());
        }
        if (request.notifyOnPriceDrop() != null) {
            item.setNotifyOnPriceDrop(request.notifyOnPriceDrop());
        }
    }
}
