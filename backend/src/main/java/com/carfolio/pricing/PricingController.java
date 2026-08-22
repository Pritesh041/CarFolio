package com.carfolio.pricing;

import com.carfolio.pricing.dto.MarketPriceResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/pricing")
public class PricingController {

    private final MarketPriceService marketPriceService;

    public PricingController(MarketPriceService marketPriceService) {
        this.marketPriceService = marketPriceService;
    }

    @GetMapping("/market-value")
    public MarketPriceResponse marketValue(
            @RequestParam String brand,
            @RequestParam String model,
            @RequestParam(required = false) String series,
            @RequestParam(required = false) String scale,
            @RequestParam(required = false) Integer year) {
        return marketPriceService.estimate(brand, model, series, scale, year);
    }
}
