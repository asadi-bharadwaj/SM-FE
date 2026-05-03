package com.sm.content.web.dto;

import com.sm.content.client.PublicUserDto;
import java.time.Instant;

public class CommentResponse {

  private String id;
  private PublicUserDto user;
  private String text;
  private Instant createdAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public PublicUserDto getUser() {
    return user;
  }

  public void setUser(PublicUserDto user) {
    this.user = user;
  }

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
