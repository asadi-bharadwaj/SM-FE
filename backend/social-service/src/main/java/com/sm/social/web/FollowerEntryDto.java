package com.sm.social.web;

public class FollowerEntryDto {

  private String userId;

  public FollowerEntryDto() {}

  public FollowerEntryDto(String userId) {
    this.userId = userId;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }
}
