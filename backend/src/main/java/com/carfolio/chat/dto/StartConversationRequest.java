package com.carfolio.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record StartConversationRequest(@NotBlank String username) {}
