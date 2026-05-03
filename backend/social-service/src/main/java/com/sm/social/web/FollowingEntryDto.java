package com.sm.social.web;

public class FollowingEntryDto {

  private String creatorId;

  public FollowingEntryDto() {}

  public FollowingEntryDto(String creatorId) {
    this.creatorId = creatorId;
  }

  public String getCreatorId() {
    return creatorId;
  }

  public void setCreatorId(String creatorId) {
    this.creatorId = creatorId;
  }
}
