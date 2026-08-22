package com.carfolio.pricing;

import com.carfolio.pricing.dto.MarketPriceResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Service
public class MarketPriceService {

    private static final Logger log = LoggerFactory.getLogger(MarketPriceService.class);
    private static final String CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String PROMPT_TEMPLATE = "You are estimating the current resale market value in USD of a "
            + "die-cast or scale model car based on your general knowledge of collector prices. "
            + "Respond with ONLY a JSON object with two fields: \"estimatedUsd\" and \"confidence\". "
            + "\"estimatedUsd\" must be a JSON number holding your best-guess typical resale price in US dollars "
            + "for a car in good condition, or JSON null if you don't have enough information to estimate — "
            + "never the word \"null\" as text and never a placeholder. "
            + "\"confidence\" must be a JSON number from 0 to 1. "
            + "For example, if you estimate $45.50 with high confidence, respond exactly: "
            + "{\"estimatedUsd\": 45.50, \"confidence\": 0.8}. Now give your actual estimate. "
            + "Car details: %s";

    private final String apiKey;
    private final String model;
    private final BigDecimal usdToInrRate;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MarketPriceService(@Value("${carfolio.groq.api-key}") String apiKey,
                               @Value("${carfolio.groq.model}") String model,
                               @Value("${carfolio.pricing.usd-to-inr-rate}") BigDecimal usdToInrRate) {
        this.apiKey = apiKey;
        this.model = model;
        this.usdToInrRate = usdToInrRate;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public MarketPriceResponse estimate(String brand, String model, String series, String scale, Integer year) {
        if (!isConfigured()) {
            return MarketPriceResponse.notFound("AI price estimation isn't configured yet");
        }

        String details = buildDetails(brand, model, series, scale, year);
        if (details.isBlank()) {
            return MarketPriceResponse.notFound("Not enough details to estimate");
        }

        Map<String, Object> requestBody = Map.of(
                "model", this.model,
                "max_tokens", 4096,
                "reasoning_format", "hidden",
                "reasoning_effort", "none",
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", PROMPT_TEMPLATE.formatted(details)
                ))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(CHAT_COMPLETIONS_URL)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return parseResponse(response);
        } catch (Exception e) {
            log.warn("AI market price estimate failed: {}", e.getMessage());
            return MarketPriceResponse.notFound("Couldn't reach the price estimation service right now");
        }
    }

    private String buildDetails(String brand, String model, String series, String scale, Integer year) {
        StringBuilder sb = new StringBuilder();
        appendIfPresent(sb, "brand", brand);
        appendIfPresent(sb, "model", model);
        appendIfPresent(sb, "series", series);
        appendIfPresent(sb, "scale", scale);
        if (year != null) {
            appendIfPresent(sb, "year", String.valueOf(year));
        }
        return sb.toString().trim();
    }

    private void appendIfPresent(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) {
            if (sb.length() > 0) {
                sb.append(", ");
            }
            sb.append(label).append(": ").append(value.trim());
        }
    }

    private MarketPriceResponse parseResponse(Map<String, Object> response) {
        if (response == null) {
            return MarketPriceResponse.notFound("Empty response from price estimation service");
        }
        Object choicesObj = response.get("choices");
        if (!(choicesObj instanceof List<?> choicesList) || choicesList.isEmpty()) {
            return MarketPriceResponse.notFound("No result from price estimation service");
        }
        Object first = choicesList.get(0);
        if (!(first instanceof Map<?, ?> firstMap)) {
            return MarketPriceResponse.notFound("No result from price estimation service");
        }
        Object messageObj = firstMap.get("message");
        if (!(messageObj instanceof Map<?, ?> messageMap)) {
            return MarketPriceResponse.notFound("No result from price estimation service");
        }
        Object text = messageMap.get("content");
        if (!(text instanceof String textStr)) {
            return MarketPriceResponse.notFound("No result from price estimation service");
        }

        String json = extractJsonObject(textStr);
        if (json == null) {
            return MarketPriceResponse.notFound("Couldn't parse price estimation result");
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            JsonNode estimatedUsdNode = node.get("estimatedUsd");
            if (estimatedUsdNode == null || estimatedUsdNode.isNull() || !estimatedUsdNode.isNumber()) {
                return MarketPriceResponse.notFound("Not enough information to estimate a price for this car");
            }
            BigDecimal estimatedUsd = estimatedUsdNode.decimalValue();
            BigDecimal estimatedInr = estimatedUsd.multiply(usdToInrRate).setScale(2, RoundingMode.HALF_UP);
            return MarketPriceResponse.of(estimatedInr, "INR");
        } catch (Exception e) {
            return MarketPriceResponse.notFound("Couldn't parse price estimation result");
        }
    }

    private String extractJsonObject(String text) {
        String cleaned = text.replaceAll("(?s)<think>.*?</think>", "");
        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start < 0 || end < 0 || end < start) {
            return null;
        }
        return cleaned.substring(start, end + 1);
    }
}
