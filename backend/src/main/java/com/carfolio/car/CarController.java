package com.carfolio.car;

import com.carfolio.car.dto.CarPhotoResponse;
import com.carfolio.car.dto.CarRequest;
import com.carfolio.car.dto.CarResponse;
import com.carfolio.car.dto.PhotoUpdateRequest;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cars")
public class CarController {

    private final CarService carService;

    public CarController(CarService carService) {
        this.carService = carService;
    }

    @GetMapping
    public Page<CarResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID brandId,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String series,
            @RequestParam(required = false) String scale,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Condition condition,
            @RequestParam(required = false) PackagingCondition packagingCondition,
            @RequestParam(required = false) BigDecimal minPurchasePrice,
            @RequestParam(required = false) BigDecimal maxPurchasePrice,
            @RequestParam(required = false) BigDecimal minValue,
            @RequestParam(required = false) BigDecimal maxValue,
            @RequestParam(required = false) String q,
            Pageable pageable) {

        CarFilter filter = new CarFilter(brandId, model, year, series, scale, color,
                condition, packagingCondition, minPurchasePrice, maxPurchasePrice, minValue, maxValue, q);

        return carService.list(principal.getId(), filter, pageable);
    }

    @PostMapping
    public ResponseEntity<CarResponse> create(@AuthenticationPrincipal UserPrincipal principal,
                                               @Valid @RequestBody CarRequest request) {
        return ResponseEntity.ok(carService.create(principal.getUser(), request));
    }

    @GetMapping("/{id}")
    public CarResponse get(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return carService.get(principal.getId(), id);
    }

    @PatchMapping("/{id}")
    public CarResponse update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                              @Valid @RequestBody CarRequest request) {
        return carService.update(principal.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        carService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public CarResponse duplicate(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return carService.duplicate(principal.getId(), id);
    }

    @PostMapping("/{id}/photos")
    public CarPhotoResponse addPhoto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                      @RequestParam("file") MultipartFile file) {
        return carService.addPhoto(principal.getId(), id, file);
    }

    @PatchMapping("/{id}/photos/{photoId}")
    public CarPhotoResponse updatePhoto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                         @PathVariable UUID photoId, @RequestBody PhotoUpdateRequest request) {
        return carService.updatePhoto(principal.getId(), id, photoId, request);
    }

    @DeleteMapping("/{id}/photos/{photoId}")
    public ResponseEntity<Void> deletePhoto(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                             @PathVariable UUID photoId) {
        carService.deletePhoto(principal.getId(), id, photoId);
        return ResponseEntity.noContent().build();
    }
}
