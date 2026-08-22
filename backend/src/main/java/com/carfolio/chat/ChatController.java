package com.carfolio.chat;

import com.carfolio.chat.dto.ConversationResponse;
import com.carfolio.chat.dto.MessageResponse;
import com.carfolio.chat.dto.StartConversationRequest;
import com.carfolio.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/conversations")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<ConversationResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return chatService.listConversations(principal.getId());
    }

    @PostMapping
    public ConversationResponse start(@AuthenticationPrincipal UserPrincipal principal,
                                       @Valid @RequestBody StartConversationRequest request) {
        Conversation conversation = chatService.startConversation(principal.getUser(), request.username());
        return chatService.getConversation(principal.getId(), conversation.getId());
    }

    @GetMapping("/{id}/messages")
    public List<MessageResponse> messages(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return chatService.listMessages(principal.getId(), id);
    }

    @PostMapping("/{id}/read")
    public void markRead(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        chatService.markRead(principal.getId(), id);
    }
}
