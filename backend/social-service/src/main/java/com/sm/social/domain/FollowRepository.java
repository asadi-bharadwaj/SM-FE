package com.sm.social.domain;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FollowRepository extends MongoRepository<Follow, Long> {

  List<Follow> findByFollowingId(Long followingId);

  List<Follow> findByFollowerId(Long followerId);

  boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

  void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
