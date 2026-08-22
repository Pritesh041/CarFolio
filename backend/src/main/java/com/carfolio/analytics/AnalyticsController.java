package com.carfolio.analytics;

import com.carfolio.analytics.dto.AcquisitionPoint;
import com.carfolio.analytics.dto.BreakdownItem;
import com.carfolio.analytics.dto.SummaryResponse;
import com.carfolio.analytics.dto.ValueHistoryPoint;
import com.carfolio.car.dto.CarResponse;
import com.carfolio.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public SummaryResponse summary(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.summary(principal.getId());
    }

    @GetMapping("/value-history")
    public List<ValueHistoryPoint> valueHistory(@AuthenticationPrincipal UserPrincipal principal,
                                                 @RequestParam(defaultValue = "ALL") String range) {
        return analyticsService.valueHistory(principal.getId(), range);
    }

    @GetMapping("/most-valuable")
    public List<CarResponse> mostValuable(@AuthenticationPrincipal UserPrincipal principal,
                                           @RequestParam(defaultValue = "10") int limit) {
        return analyticsService.mostValuable(principal.getId(), limit);
    }

    @GetMapping("/by-brand")
    public List<BreakdownItem> byBrand(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byBrand(principal.getId());
    }

    @GetMapping("/by-scale")
    public List<BreakdownItem> byScale(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byScale(principal.getId());
    }

    @GetMapping("/by-year")
    public List<BreakdownItem> byYear(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byYear(principal.getId());
    }

    @GetMapping("/by-condition")
    public List<BreakdownItem> byCondition(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byCondition(principal.getId());
    }

    @GetMapping("/by-packaging")
    public List<BreakdownItem> byPackaging(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byPackaging(principal.getId());
    }

    @GetMapping("/by-hunt-type")
    public List<BreakdownItem> byHuntType(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.byHuntType(principal.getId());
    }

    @GetMapping("/top-gainers")
    public List<CarResponse> topGainers(@AuthenticationPrincipal UserPrincipal principal,
                                         @RequestParam(defaultValue = "5") int limit) {
        return analyticsService.topGainers(principal.getId(), limit);
    }

    @GetMapping("/top-losers")
    public List<CarResponse> topLosers(@AuthenticationPrincipal UserPrincipal principal,
                                        @RequestParam(defaultValue = "5") int limit) {
        return analyticsService.topLosers(principal.getId(), limit);
    }

    @GetMapping("/acquisitions")
    public List<AcquisitionPoint> acquisitions(@AuthenticationPrincipal UserPrincipal principal) {
        return analyticsService.acquisitions(principal.getId());
    }
}
