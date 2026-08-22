package com.carfolio.chat.dto;

import com.carfolio.chat.Message;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        UUID id,
        UUID conversationId,
        UUID senderId,
        String senderUsername,
        String senderName,
        String content,
        boolean automated,
        Instant createdAt
) {
    public static MessageResponse from(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getSender().getId(),
                message.getSender().getUsername(),
                message.getSender().getName(),
                message.getContent(),
                message.isAutomated(),
                message.getCreatedAt()
        );
    }
}
