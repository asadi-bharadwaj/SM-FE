package com.sm.chat.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ConversationRepository extends MongoRepository<Conversation, Long> {

  Optional<Conversation> findByUserAAndUserB(Long userA, Long userB);

  @Query("{ $or: [ { 'userA': ?0 }, { 'userB': ?0 } ] }")
  List<Conversation> findParticipating(Long userId);
}
