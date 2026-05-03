package com.sm.content.domain;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SavedPostRepository extends MongoRepository<SavedPostEntity, String> {

  Optional<SavedPostEntity> findByPostIdAndUserId(Long postId, Long userId);

  void deleteByPostIdAndUserId(Long postId, Long userId);
}
