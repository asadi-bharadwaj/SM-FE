package com.sm.chat.web.dto;

public class ConversationSummaryDto {

  private String id;
  private String otherUserId;
  private LastMessageDto lastMessage;
  private int unreadCount;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getOtherUserId() {
    return otherUserId;
  }

  public void setOtherUserId(String otherUserId) {
    this.otherUserId = otherUserId;
  }

  public LastMessageDto getLastMessage() {
    return lastMessage;
  }

  public void setLastMessage(LastMessageDto lastMessage) {
    this.lastMessage = lastMessage;
  }

  public int getUnreadCount() {
    return unreadCount;
  }

  public void setUnreadCount(int unreadCount) {
    this.unreadCount = unreadCount;
  }
}
