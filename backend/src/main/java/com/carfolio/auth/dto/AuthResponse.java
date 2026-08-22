package com.carfolio.auth.dto;

public record AuthResponse(String accessToken, String refreshToken, UserSummary user) {

    public record UserSummary(String id, String name, String username, String email, boolean emailVerified) {}
}
