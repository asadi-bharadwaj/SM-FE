package com.sm.content.domain;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PostRepository extends MongoRepository<PostEntity, Long> {

  List<PostEntity> findByAuthorIdOrderByCreatedAtDesc(Long authorId);

  Optional<PostEntity> findFirstByOrderByIdDesc();
}
