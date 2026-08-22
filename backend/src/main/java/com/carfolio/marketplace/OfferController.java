package com.carfolio.marketplace;

import com.carfolio.marketplace.dto.OfferRequest;
import com.carfolio.marketplace.dto.OfferResponse;
import com.carfolio.marketplace.dto.OfferStatusUpdateRequest;
import com.carfolio.marketplace.dto.PurchaseResponse;
import com.carfolio.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
@RequestMapping("/api/v1")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    @PostMapping("/listings/{id}/offers")
    public ResponseEntity<OfferResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                                 @PathVariable UUID id,
                                                 @Valid @RequestBody OfferRequest request) {
        return ResponseEntity.ok(offerService.create(principal.getUser(), id, request));
    }

    @GetMapping("/listings/{id}/offers")
    public List<OfferResponse> list(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return offerService.listForListing(principal.getId(), id);
    }

    @GetMapping("/offers/mine/purchases")
    public List<PurchaseResponse> myPurchases(@AuthenticationPrincipal UserPrincipal principal) {
        return offerService.myPurchases(principal.getId());
    }

    @PatchMapping("/offers/{id}")
    public OfferResponse updateStatus(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                       @Valid @RequestBody OfferStatusUpdateRequest request) {
        return offerService.updateStatus(principal.getId(), id, request.status());
    }
}
