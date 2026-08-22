package com.carfolio.chat.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        Participant otherParticipant,
        String lastMessage,
        Instant lastMessageAt,
        long unreadCount
) {
    public record Participant(UUID id, String username, String name, String avatarUrl) {}
}
