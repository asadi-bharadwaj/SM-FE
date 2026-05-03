package com.sm.chat.web;

import com.sm.chat.web.dto.ConversationSummaryDto;
import com.sm.chat.web.dto.MessageDto;
import com.sm.chat.web.dto.OpenConversationRequest;
import com.sm.chat.web.dto.OpenConversationResponse;
import com.sm.chat.web.dto.SendMessageRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping
public class ChatRestController {

  private final ChatMessagingService chatMessagingService;

  public ChatRestController(ChatMessagingService chatMessagingService) {
    this.chatMessagingService = chatMessagingService;
  }

  @GetMapping("/health")
  public ResponseEntity<java.util.Map<String, String>> health() {
    return ResponseEntity.ok(java.util.Map.of("status", "UP", "service", "chat-service"));
  }

  @GetMapping("/conversations")
  public List<ConversationSummaryDto> list(
      @RequestHeader(value = "X-User-Id", required = false) String userHeader) {
    Long uid = requireUserId(userHeader);
    return chatMessagingService.listForUser(uid);
  }

  @PostMapping("/conversations")
  public ResponseEntity<OpenConversationResponse> open(
      @RequestHeader(value = "X-User-Id", required = false) String userHeader,
      @Valid @RequestBody OpenConversationRequest body) {
    Long uid = requireUserId(userHeader);
    OpenConversationResponse res = chatMessagingService.getOrCreate(uid, body.getOtherUserId());
    return ResponseEntity.ok(res);
  }

  @GetMapping("/conversations/{conversationId}")
  public ConversationSummaryDto getOne(
      @RequestHeader(value = "X-User-Id", required = false) String userHeader,
      @PathVariable Long conversationId) {
    Long uid = requireUserId(userHeader);
    return chatMessagingService.getSummary(uid, conversationId);
  }

  @GetMapping("/conversations/{conversationId}/messages")
  public List<MessageDto> messages(
      @RequestHeader(value = "X-User-Id", required = false) String userHeader,
      @PathVariable Long conversationId) {
    Long uid = requireUserId(userHeader);
    return chatMessagingService.listMessages(uid, conversationId);
  }

  @PostMapping("/conversations/{conversationId}/messages")
  public ResponseEntity<MessageDto> send(
      @RequestHeader(value = "X-User-Id", required = false) String userHeader,
      @PathVariable Long conversationId,
      @Valid @RequestBody SendMessageRequest body) {
    Long uid = requireUserId(userHeader);
    MessageDto saved =
        chatMessagingService.sendMessage(uid, conversationId, body.getBody());
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }

  private static Long requireUserId(String header) {
    if (header == null || header.isBlank()) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing X-User-Id");
    }
    try {
      return Long.parseLong(header.trim());
    } catch (NumberFormatException e) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid X-User-Id");
    }
  }
}
