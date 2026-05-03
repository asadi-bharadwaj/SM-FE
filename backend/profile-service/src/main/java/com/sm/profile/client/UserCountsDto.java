package com.sm.profile.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserCountsDto {

  private long subscriberCount;
  private long followingCount;

  public long getSubscriberCount() {
    return subscriberCount;
  }

  public void setSubscriberCount(long subscriberCount) {
    this.subscriberCount = subscriberCount;
  }

  public long getFollowingCount() {
    return followingCount;
  }

  public void setFollowingCount(long followingCount) {
    this.followingCount = followingCount;
  }
}
