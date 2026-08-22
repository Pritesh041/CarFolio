package com.carfolio.chat;

import com.carfolio.chat.dto.SendMessageRequest;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.user.User;
import com.carfolio.user.UserRepository;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatWebSocketController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @MessageMapping("/conversations/{id}/messages")
    public void send(@DestinationVariable("id") UUID conversationId,
                      @Payload SendMessageRequest request,
                      Principal principal) {
        UUID senderId = UUID.fromString(principal.getName());
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        Conversation conversation = chatService.findAccessible(senderId, conversationId);
        chatService.sendMessage(conversation, sender, request.content(), false);
    }
}
