package com.sm.content.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostLikeRepository extends MongoRepository<PostLikeEntity, String> {

  long countByPostId(Long postId);

  Optional<PostLikeEntity> findByPostIdAndUserId(Long postId, Long userId);

  void deleteByPostIdAndUserId(Long postId, Long userId);

  List<PostLikeEntity> findByPostIdOrderByCreatedAtDesc(Long postId);
}
