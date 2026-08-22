package com.carfolio.identification;

import com.carfolio.identification.dto.IdentificationResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class IdentificationService {

    private static final Logger log = LoggerFactory.getLogger(IdentificationService.class);
    private static final String CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String PROMPT = "You are identifying a die-cast or scale model car from a photo. "
            + "Respond with ONLY a JSON object with these fields: brand, model, series, scale, color, confidence. "
            + "Each of brand/model/series/scale/color must be a JSON string with your best guess, or JSON null if unknown "
            + "— never the word \"null\" as text and never a placeholder. "
            + "\"brand\" should be the manufacturer (e.g. Hot Wheels, Matchbox, Tomica, Maisto, Bburago). "
            + "\"scale\" should be a ratio like \"1:64\" or \"1:18\" if visible on packaging, else null. "
            + "\"confidence\" must be a JSON number from 0 to 1. If you cannot identify the car at all, set brand and model to null and confidence to 0. "
            + "For example: {\"brand\": \"Hot Wheels\", \"model\": \"'67 Camaro\", \"series\": null, \"scale\": \"1:64\", \"color\": \"red\", \"confidence\": 0.75}. "
            + "Now give your actual identification for this photo.";

    private final String apiKey;
    private final String model;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public IdentificationService(@Value("${carfolio.groq.api-key}") String apiKey,
                                  @Value("${carfolio.groq.model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }

    public IdentificationResponse identify(MultipartFile file) {
        if (!isConfigured()) {
            return IdentificationResponse.notFound("AI identification isn't configured yet");
        }

        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        String base64;
        try {
            base64 = Base64.getEncoder().encodeToString(file.getBytes());
        } catch (IOException e) {
            return IdentificationResponse.notFound("Couldn't read the uploaded photo");
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 4096,
                "reasoning_format", "hidden",
                "reasoning_effort", "none",
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", List.of(
                                Map.of("type", "text", "text", PROMPT),
                                Map.of("type", "image_url", "image_url", Map.of(
                                        "url", "data:" + contentType + ";base64," + base64))
                        )
                ))
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(CHAT_COMPLETIONS_URL)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            return parseResponse(response);
        } catch (Exception e) {
            log.warn("AI identification request failed: {}", e.getMessage());
            return IdentificationResponse.notFound("Couldn't reach the identification service right now");
        }
    }

    private IdentificationResponse parseResponse(Map<String, Object> response) {
        if (response == null) {
            return IdentificationResponse.notFound("Empty response from identification service");
        }
        Object choicesObj = response.get("choices");
        if (!(choicesObj instanceof List<?> choicesList) || choicesList.isEmpty()) {
            return IdentificationResponse.notFound("No result from identification service");
        }
        Object first = choicesList.get(0);
        if (!(first instanceof Map<?, ?> firstMap)) {
            return IdentificationResponse.notFound("No result from identification service");
        }
        Object messageObj = firstMap.get("message");
        if (!(messageObj instanceof Map<?, ?> messageMap)) {
            return IdentificationResponse.notFound("No result from identification service");
        }
        Object text = messageMap.get("content");
        if (!(text instanceof String textStr)) {
            return IdentificationResponse.notFound("No result from identification service");
        }

        String json = extractJsonObject(textStr);
        if (json == null) {
            return IdentificationResponse.notFound("Couldn't parse identification result");
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            String brand = textOrNull(node, "brand");
            String modelGuess = textOrNull(node, "model");
            String series = textOrNull(node, "series");
            String scale = textOrNull(node, "scale");
            String color = textOrNull(node, "color");
            Double confidence = node.hasNonNull("confidence") ? node.get("confidence").asDouble() : null;

            if (brand == null && modelGuess == null) {
                return IdentificationResponse.notFound("Couldn't identify this car from the photo");
            }
            return IdentificationResponse.of(brand, modelGuess, series, scale, color, confidence);
        } catch (Exception e) {
            return IdentificationResponse.notFound("Couldn't parse identification result");
        }
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && !value.isNull() ? value.asText() : null;
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
