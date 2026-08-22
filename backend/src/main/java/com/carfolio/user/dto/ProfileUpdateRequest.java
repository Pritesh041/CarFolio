package com.carfolio.user.dto;

public record ProfileUpdateRequest(String name, String avatarUrl, String bio, String location, String website) {}
