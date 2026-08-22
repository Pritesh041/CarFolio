package com.carfolio.wishlist;

import com.carfolio.security.UserPrincipal;
import com.carfolio.wishlist.dto.WishlistRequest;
import com.carfolio.wishlist.dto.WishlistResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<WishlistResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return wishlistService.list(principal.getId());
    }

    @PostMapping
    public WishlistResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                    @Valid @RequestBody WishlistRequest request) {
        return wishlistService.create(principal.getUser(), request);
    }

    @PatchMapping("/{id}")
    public WishlistResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                    @Valid @RequestBody WishlistRequest request) {
        return wishlistService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        wishlistService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
