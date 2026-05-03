package com.sm.chat.web;

import com.sm.chat.domain.ChatMessageEntity;
import com.sm.chat.domain.ChatMessageRepository;
import com.sm.chat.domain.Conversation;
import com.sm.chat.domain.ConversationRepository;
import com.sm.chat.web.dto.ConversationSummaryDto;
import com.sm.chat.web.dto.LastMessageDto;
import com.sm.chat.web.dto.MessageDto;
import com.sm.chat.web.dto.OpenConversationResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChatMessagingService {

  private final ConversationRepository conversationRepository;
  private final ChatMessageRepository chatMessageRepository;

  public ChatMessagingService(
      ConversationRepository conversationRepository,
      ChatMessageRepository chatMessageRepository) {
    this.conversationRepository = conversationRepository;
    this.chatMessageRepository = chatMessageRepository;
  }

  public List<ConversationSummaryDto> listForUser(Long userId) {
    List<Conversation> convs = conversationRepository.findParticipating(userId);
    List<ConversationSummaryDto> out = new ArrayList<>();
    for (Conversation c : convs) {
      out.add(toSummary(userId, c));
    }
    out.sort(
        Comparator.comparing(
                (ConversationSummaryDto s) ->
                    Optional.ofNullable(s.getLastMessage())
                        .map(LastMessageDto::getCreatedAt)
                        .orElse(Instant.EPOCH),
                Comparator.nullsFirst(Comparator.naturalOrder()))
            .reversed());
    return out;
  }

  public OpenConversationResponse getOrCreate(Long currentUserId, Long otherUserId) {
    if (currentUserId.equals(otherUserId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot message yourself");
    }
    long[] pair = Conversation.normalizePair(currentUserId, otherUserId);
    Conversation c =
        conversationRepository
            .findByUserAAndUserB(pair[0], pair[1])
            .orElseGet(
                () -> {
                  Conversation n = new Conversation();
                  n.setId(nextConversationId());
                  n.setUserA(pair[0]);
                  n.setUserB(pair[1]);
                  return conversationRepository.save(n);
                });
    return new OpenConversationResponse(String.valueOf(c.getId()));
  }

  private long nextConversationId() {
    return conversationRepository.findAll().stream()
            .mapToLong(Conversation::getId)
            .max()
            .orElse(0L)
        + 1;
  }

  private long nextMessageId() {
    return chatMessageRepository.findAll().stream()
            .mapToLong(ChatMessageEntity::getId)
            .max()
            .orElse(0L)
        + 1;
  }

  public ConversationSummaryDto getSummary(Long requesterId, Long conversationId) {
    Conversation c = findConversationOr404(conversationId);
    assertParticipant(requesterId, c);
    return toSummary(requesterId, c);
  }

  public List<MessageDto> listMessages(Long requesterId, Long conversationId) {
    Conversation c = findConversationOr404(conversationId);
    assertParticipant(requesterId, c);
    return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId).stream()
        .map(this::toMessageDto)
        .collect(Collectors.toList());
  }

  public MessageDto sendMessage(Long senderId, Long conversationId, String body) {
    Conversation c = findConversationOr404(conversationId);
    assertParticipant(senderId, c);
    String trimmed = body.trim();
    if (trimmed.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty message");
    }

    ChatMessageEntity m = new ChatMessageEntity();
    m.setId(nextMessageId());
    m.setConversationId(conversationId);
    m.setSenderId(senderId);
    m.setBody(trimmed);
    m.setCreatedAt(Instant.now());
    chatMessageRepository.save(m);
    return toMessageDto(m);
  }

  private Conversation findConversationOr404(Long id) {
    return conversationRepository
        .findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversation"));
  }

  private void assertParticipant(Long userId, Conversation c) {
    if (!c.getUserA().equals(userId) && !c.getUserB().equals(userId)) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not a participant");
    }
  }

  private ConversationSummaryDto toSummary(Long viewerId, Conversation c) {
    ConversationSummaryDto d = new ConversationSummaryDto();
    d.setId(String.valueOf(c.getId()));
    d.setOtherUserId(String.valueOf(Conversation.otherParticipant(viewerId, c)));
    d.setUnreadCount(0);

    ChatMessageEntity last =
        chatMessageRepository.findFirstByConversationIdOrderByCreatedAtDesc(c.getId());
    if (last != null) {
      LastMessageDto lm = new LastMessageDto();
      lm.setBody(last.getBody());
      lm.setCreatedAt(last.getCreatedAt());
      lm.setSenderId(String.valueOf(last.getSenderId()));
      d.setLastMessage(lm);
    }

    return d;
  }

  private MessageDto toMessageDto(ChatMessageEntity m) {
    MessageDto d = new MessageDto();
    d.setId(String.valueOf(m.getId()));
    d.setConversationId(String.valueOf(m.getConversationId()));
    d.setSenderId(String.valueOf(m.getSenderId()));
    d.setBody(m.getBody());
    d.setCreatedAt(m.getCreatedAt());
    return d;
  }
}
