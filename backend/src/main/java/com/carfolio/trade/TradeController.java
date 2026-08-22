package com.carfolio.trade;

import com.carfolio.security.UserPrincipal;
import com.carfolio.trade.dto.TradeRequest;
import com.carfolio.trade.dto.TradeResponse;
import com.carfolio.trade.dto.TradeStatusUpdateRequest;
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
@RequestMapping("/api/v1/trades")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping
    public ResponseEntity<TradeResponse> propose(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody TradeRequest request) {
        return ResponseEntity.ok(tradeService.propose(principal.getUser(), request));
    }

    @GetMapping("/mine")
    public List<TradeResponse> mine(@AuthenticationPrincipal UserPrincipal principal) {
        return tradeService.listForUser(principal.getId());
    }

    @PatchMapping("/{id}")
    public TradeResponse updateStatus(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id,
                                       @Valid @RequestBody TradeStatusUpdateRequest request) {
        return tradeService.updateStatus(principal.getId(), id, request.status());
    }
}
