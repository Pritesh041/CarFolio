package com.carfolio.collection;

import com.carfolio.collection.dto.AddCarsRequest;
import com.carfolio.collection.dto.CollectionCarOrderRequest;
import com.carfolio.collection.dto.CollectionRequest;
import com.carfolio.collection.dto.CollectionResponse;
import com.carfolio.security.UserPrincipal;
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
@RequestMapping("/api/v1/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @GetMapping
    public List<CollectionResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return collectionService.list(principal.getId());
    }

    @PostMapping
    public CollectionResponse create(@AuthenticationPrincipal UserPrincipal principal,
                                      @Valid @RequestBody CollectionRequest request) {
        return collectionService.create(principal.getUser(), request);
    }

    @GetMapping("/{id}")
    public CollectionResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return collectionService.get(principal.getId(), id);
    }

    @PatchMapping("/{id}")
    public CollectionResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                      @Valid @RequestBody CollectionRequest request) {
        return collectionService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        collectionService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/cars")
    public CollectionResponse addCars(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                       @Valid @RequestBody AddCarsRequest request) {
        return collectionService.addCars(principal.getId(), id, request.carIds());
    }

    @DeleteMapping("/{id}/cars/{carId}")
    public CollectionResponse removeCar(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                         @PathVariable UUID carId) {
        return collectionService.removeCar(principal.getId(), id, carId);
    }

    @PatchMapping("/{id}/cars/order")
    public CollectionResponse reorder(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                       @Valid @RequestBody CollectionCarOrderRequest request) {
        return collectionService.reorder(principal.getId(), id, request.carIds());
    }

    @PostMapping("/{id}/publish")
    public CollectionResponse publish(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return collectionService.publish(principal.getId(), id);
    }

    @PostMapping("/{id}/unpublish")
    public CollectionResponse unpublish(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return collectionService.unpublish(principal.getId(), id);
    }
}
