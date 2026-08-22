package com.carfolio.wishlist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistItem, UUID> {

    List<WishlistItem> findByUserIdOrderByPriorityDescCreatedAtDesc(UUID userId);

    @Query("select w from WishlistItem w where lower(w.model) = lower(:model) "
            + "and (w.brand is null or w.brand.id = :brandId) "
            + "and w.user.id <> :excludeUserId "
            + "and (w.notifyOnAvailable = true or w.notifyOnPriceDrop = true)")
    List<WishlistItem> findMatching(@Param("model") String model, @Param("brandId") UUID brandId,
                                     @Param("excludeUserId") UUID excludeUserId);
}
