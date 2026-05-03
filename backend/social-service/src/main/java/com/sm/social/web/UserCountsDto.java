package com.sm.social.web;

public class UserCountsDto {

  private long subscriberCount;
  private long followingCount;

  public UserCountsDto() {}

  public UserCountsDto(long subscriberCount, long followingCount) {
    this.subscriberCount = subscriberCount;
    this.followingCount = followingCount;
  }

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
