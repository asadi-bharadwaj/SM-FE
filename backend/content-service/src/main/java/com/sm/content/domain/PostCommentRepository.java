package com.sm.content.domain;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostCommentRepository extends MongoRepository<PostCommentEntity, String> {

  List<PostCommentEntity> findByPostIdOrderByCreatedAtAsc(Long postId);
}
