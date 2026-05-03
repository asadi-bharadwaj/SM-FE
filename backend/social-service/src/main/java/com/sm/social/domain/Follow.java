package com.sm.social.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "follows")
@CompoundIndex(name = "uniq_follow", def = "{'followerId': 1, 'followingId': 1}", unique = true)
public class Follow {

  @Id private Long id;

  private Long followerId;
  private Long followingId;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getFollowerId() {
    return followerId;
  }

  public void setFollowerId(Long followerId) {
    this.followerId = followerId;
  }

  public Long getFollowingId() {
    return followingId;
  }

  public void setFollowingId(Long followingId) {
    this.followingId = followingId;
  }
}
