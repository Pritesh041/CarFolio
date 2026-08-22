package com.carfolio.brand;

import com.carfolio.brand.dto.BrandResponse;
import com.carfolio.common.exception.NotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
public class BrandController {

    private final BrandRepository brandRepository;

    public BrandController(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    @GetMapping
    public List<BrandResponse> list() {
        return brandRepository.findAll().stream()
                .sorted(Comparator.comparing(Brand::getName))
                .map(BrandResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public BrandResponse get(@PathVariable UUID id) {
        return brandRepository.findById(id)
                .map(BrandResponse::from)
                .orElseThrow(() -> new NotFoundException("BRAND_NOT_FOUND", "Brand not found"));
    }
}
