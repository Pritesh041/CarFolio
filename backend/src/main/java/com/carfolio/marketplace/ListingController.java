package com.carfolio.marketplace;

import com.carfolio.car.Condition;
import com.carfolio.marketplace.dto.ListingPhotoResponse;
import com.carfolio.marketplace.dto.ListingRequest;
import com.carfolio.marketplace.dto.ListingResponse;
import com.carfolio.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class ListingController {

    private final ListingService listingService;

    public ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    @GetMapping("/marketplace/listings")
    public Page<ListingResponse> browse(
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) String scale,
            @RequestParam(required = false) Condition condition,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String q,
            Pageable pageable) {
        ListingFilter filter = new ListingFilter(brandId, scale, condition, minPrice, maxPrice, q);
        return listingService.browse(filter, pageable);
    }

    @GetMapping("/listings/mine")
    public List<ListingResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return listingService.mine(principal.getId());
    }

    @PostMapping("/listings")
    public ResponseEntity<ListingResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                   @Valid @RequestBody ListingRequest request) {
        return ResponseEntity.ok(listingService.create(principal.getUser(), request));
    }

    @GetMapping("/listings/{id}")
    public ListingResponse get(@PathVariable UUID id) {
        return listingService.get(id);
    }

    @PatchMapping("/listings/{id}")
    public ListingResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                   @Valid @RequestBody ListingRequest request) {
        return listingService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/listings/{id}")
    public ResponseEntity<Void> cancel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        listingService.cancel(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/listings/{id}/photos")
    public ListingPhotoResponse addPhoto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                          @RequestParam("file") MultipartFile file) {
        return listingService.addPhoto(principal.getId(), id, file);
    }

    @DeleteMapping("/listings/{id}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                             @PathVariable UUID photoId) {
        listingService.deletePhoto(principal.getId(), id, photoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/listings/{id}/mark-sold")
    public ListingResponse markSold(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return listingService.markSold(principal.getId(), id);
    }
}
