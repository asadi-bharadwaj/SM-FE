package com.sm.chat.web.dto;

public class OpenConversationResponse {

  private String conversationId;

  public OpenConversationResponse() {}

  public OpenConversationResponse(String conversationId) {
    this.conversationId = conversationId;
  }

  public String getConversationId() {
    return conversationId;
  }

  public void setConversationId(String conversationId) {
    this.conversationId = conversationId;
  }
}
