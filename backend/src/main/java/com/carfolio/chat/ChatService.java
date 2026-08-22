package com.carfolio.chat;

import com.carfolio.chat.dto.ConversationResponse;
import com.carfolio.chat.dto.MessageResponse;
import com.carfolio.common.exception.ConflictException;
import com.carfolio.common.exception.NotFoundException;
import com.carfolio.user.User;
import com.carfolio.user.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatService(ConversationRepository conversationRepository,
                        MessageRepository messageRepository,
                        UserRepository userRepository,
                        SimpMessagingTemplate messagingTemplate) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Conversation findOrCreateConversation(User a, User b) {
        return conversationRepository.findBetween(a.getId(), b.getId())
                .orElseGet(() -> {
                    Conversation conversation = new Conversation();
                    conversation.setParticipantOne(a);
                    conversation.setParticipantTwo(b);
                    return conversationRepository.save(conversation);
                });
    }

    @Transactional
    public Conversation startConversation(User initiator, String otherUsername) {
        User other = userRepository.findByUsername(otherUsername)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        if (other.getId().equals(initiator.getId())) {
            throw new ConflictException("CANNOT_MESSAGE_SELF", "You can't start a conversation with yourself");
        }
        return findOrCreateConversation(initiator, other);
    }

    @Transactional
    public MessageResponse sendMessage(Conversation conversation, User sender, String content, boolean automated) {
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        message.setAutomated(automated);
        message = messageRepository.save(message);
        conversation.setUpdatedAt(Instant.now());

        MessageResponse response = MessageResponse.from(message);
        messagingTemplate.convertAndSend("/topic/conversations/" + conversation.getId(), response);
        User recipient = conversation.otherParticipant(sender.getId());
        messagingTemplate.convertAndSendToUser(recipient.getId().toString(), "/queue/inbox", response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(UUID userId) {
        return conversationRepository.findAllForUser(userId).stream()
                .map(conversation -> toConversationResponse(conversation, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public ConversationResponse getConversation(UUID userId, UUID conversationId) {
        Conversation conversation = findAccessible(userId, conversationId);
        return toConversationResponse(conversation, userId);
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(UUID userId, UUID conversationId) {
        Conversation conversation = findAccessible(userId, conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId())
                .stream().map(MessageResponse::from).toList();
    }

    @Transactional
    public void markRead(UUID userId, UUID conversationId) {
        Conversation conversation = findAccessible(userId, conversationId);
        conversation.markReadFor(userId, Instant.now());
    }

    Conversation findAccessible(UUID userId, UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("CONVERSATION_NOT_FOUND", "Conversation not found"));
        if (!conversation.hasParticipant(userId)) {
            throw new NotFoundException("CONVERSATION_NOT_FOUND", "Conversation not found");
        }
        return conversation;
    }

    private ConversationResponse toConversationResponse(Conversation conversation, UUID userId) {
        User other = conversation.otherParticipant(userId);
        Message lastMessage = messageRepository.findTopByConversationIdOrderByCreatedAtDesc(conversation.getId()).orElse(null);
        Instant lastRead = conversation.lastReadAtFor(userId);
        long unread = messageRepository.countByConversationIdAndSenderIdNotAndCreatedAtAfter(
                conversation.getId(), userId, lastRead != null ? lastRead : Instant.EPOCH);

        return new ConversationResponse(
                conversation.getId(),
                new ConversationResponse.Participant(other.getId(), other.getUsername(), other.getName(), other.getAvatarUrl()),
                lastMessage != null ? lastMessage.getContent() : null,
                lastMessage != null ? lastMessage.getCreatedAt() : null,
                unread
        );
    }
}
