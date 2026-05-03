package com.sm.content.web.dto;

import java.util.ArrayList;
import java.util.List;

public class EngagementResponse {

  private long likeCount;
  private boolean liked;
  private boolean saved;
  private List<CommentResponse> comments = new ArrayList<>();

  public long getLikeCount() {
    return likeCount;
  }

  public void setLikeCount(long likeCount) {
    this.likeCount = likeCount;
  }

  public boolean isLiked() {
    return liked;
  }

  public void setLiked(boolean liked) {
    this.liked = liked;
  }

  public boolean isSaved() {
    return saved;
  }

  public void setSaved(boolean saved) {
    this.saved = saved;
  }

  public List<CommentResponse> getComments() {
    return comments;
  }

  public void setComments(List<CommentResponse> comments) {
    this.comments = comments;
  }
}
