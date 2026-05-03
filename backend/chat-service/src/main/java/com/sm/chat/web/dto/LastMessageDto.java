package com.sm.chat.web.dto;

import java.time.Instant;

public class LastMessageDto {

  private String body;
  private Instant createdAt;
  private String senderId;

  public LastMessageDto() {}

  public LastMessageDto(String body, Instant createdAt, String senderId) {
    this.body = body;
    this.createdAt = createdAt;
    this.senderId = senderId;
  }

  public String getBody() {
    return body;
  }

  public void setBody(String body) {
    this.body = body;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public String getSenderId() {
    return senderId;
  }

  public void setSenderId(String senderId) {
    this.senderId = senderId;
  }
}
