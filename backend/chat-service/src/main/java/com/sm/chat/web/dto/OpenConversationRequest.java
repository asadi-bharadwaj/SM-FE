package com.sm.chat.web.dto;

import jakarta.validation.constraints.NotNull;

public class OpenConversationRequest {

  @NotNull private Long otherUserId;

  public Long getOtherUserId() {
    return otherUserId;
  }

  public void setOtherUserId(Long otherUserId) {
    this.otherUserId = otherUserId;
  }
}
