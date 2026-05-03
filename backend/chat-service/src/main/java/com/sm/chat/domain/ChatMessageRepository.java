package com.sm.chat.domain;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessageEntity, Long> {

  List<ChatMessageEntity> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

  ChatMessageEntity findFirstByConversationIdOrderByCreatedAtDesc(Long conversationId);
}
