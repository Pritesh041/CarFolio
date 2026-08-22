package com.carfolio.identification.dto;

public record IdentificationResponse(
        boolean found,
        String brandGuess,
        String modelGuess,
        String seriesGuess,
        String scaleGuess,
        String colorGuess,
        Double confidence,
        String message
) {
    public static IdentificationResponse notFound(String message) {
        return new IdentificationResponse(false, null, null, null, null, null, null, message);
    }

    public static IdentificationResponse of(String brand, String model, String series, String scale, String color, Double confidence) {
        return new IdentificationResponse(true, brand, model, series, scale, color, confidence, null);
    }
}
