package com.sm.content.web;

import com.sm.content.client.ProfileServiceClient;
import com.sm.content.client.PublicUserDto;
import com.sm.content.domain.PostCommentEntity;
import com.sm.content.domain.PostCommentRepository;
import com.sm.content.domain.PostLikeEntity;
import com.sm.content.domain.PostLikeRepository;
import com.sm.content.domain.PostRepository;
import com.sm.content.domain.SavedPostEntity;
import com.sm.content.domain.SavedPostRepository;
import com.sm.content.web.dto.CommentResponse;
import com.sm.content.web.dto.EngagementResponse;
import com.sm.content.web.dto.LikersResponse;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostEngagementService {

  private static final int MAX_LIKERS = 100;

  private final PostRepository postRepository;
  private final PostLikeRepository likeRepository;
  private final PostCommentRepository commentRepository;
  private final SavedPostRepository savedRepository;
  private final ProfileServiceClient profileClient;

  public PostEngagementService(
      PostRepository postRepository,
      PostLikeRepository likeRepository,
      PostCommentRepository commentRepository,
      SavedPostRepository savedRepository,
      ProfileServiceClient profileClient) {
    this.postRepository = postRepository;
    this.likeRepository = likeRepository;
    this.commentRepository = commentRepository;
    this.savedRepository = savedRepository;
    this.profileClient = profileClient;
  }

  public EngagementResponse getEngagement(long postId, Long viewerUserId) {
    ensurePostExists(postId);
    EngagementResponse out = new EngagementResponse();
    out.setLikeCount(likeRepository.countByPostId(postId));
    if (viewerUserId != null) {
      out.setLiked(likeRepository.findByPostIdAndUserId(postId, viewerUserId).isPresent());
      out.setSaved(savedRepository.findByPostIdAndUserId(postId, viewerUserId).isPresent());
    } else {
      out.setLiked(false);
      out.setSaved(false);
    }
    List<CommentResponse> comments = new ArrayList<>();
    for (PostCommentEntity c : commentRepository.findByPostIdOrderByCreatedAtAsc(postId)) {
      comments.add(toCommentResponse(c));
    }
    out.setComments(comments);
    return out;
  }

  public LikersResponse listLikers(long postId, int limit) {
    ensurePostExists(postId);
    int cap = Math.min(Math.max(limit, 1), MAX_LIKERS);
    LikersResponse out = new LikersResponse();
    List<PostLikeEntity> likes = likeRepository.findByPostIdOrderByCreatedAtDesc(postId);
    List<PublicUserDto> users = new ArrayList<>();
    int n = 0;
    for (PostLikeEntity like : likes) {
      if (n >= cap) break;
      users.add(profileClient.getPublicProfile(like.getUserId()));
      n++;
    }
    out.setUsers(users);
    return out;
  }

  public void like(long postId, long userId) {
    ensurePostExists(postId);
    if (likeRepository.findByPostIdAndUserId(postId, userId).isPresent()) {
      return;
    }
    PostLikeEntity e = new PostLikeEntity();
    e.setId(UUID.randomUUID().toString());
    e.setPostId(postId);
    e.setUserId(userId);
    e.setCreatedAt(Instant.now());
    likeRepository.save(e);
  }

  public void unlike(long postId, long userId) {
    ensurePostExists(postId);
    likeRepository.deleteByPostIdAndUserId(postId, userId);
  }

  public CommentResponse addComment(long postId, long userId, String text) {
    ensurePostExists(postId);
    String trimmed = text.trim();
    if (trimmed.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Empty comment");
    }
    if (trimmed.length() > 2200) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment too long");
    }
    PostCommentEntity e = new PostCommentEntity();
    e.setId(UUID.randomUUID().toString());
    e.setPostId(postId);
    e.setUserId(userId);
    e.setText(trimmed);
    e.setCreatedAt(Instant.now());
    commentRepository.save(e);
    return toCommentResponse(e);
  }

  public void savePost(long postId, long userId) {
    ensurePostExists(postId);
    if (savedRepository.findByPostIdAndUserId(postId, userId).isPresent()) {
      return;
    }
    SavedPostEntity e = new SavedPostEntity();
    e.setId(UUID.randomUUID().toString());
    e.setPostId(postId);
    e.setUserId(userId);
    e.setCreatedAt(Instant.now());
    savedRepository.save(e);
  }

  public void unsavePost(long postId, long userId) {
    ensurePostExists(postId);
    savedRepository.deleteByPostIdAndUserId(postId, userId);
  }

  private void ensurePostExists(long postId) {
    if (!postRepository.existsById(postId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
    }
  }

  private CommentResponse toCommentResponse(PostCommentEntity c) {
    CommentResponse r = new CommentResponse();
    r.setId(c.getId());
    r.setText(c.getText());
    r.setCreatedAt(c.getCreatedAt());
    r.setUser(profileClient.getPublicProfile(c.getUserId()));
    return r;
  }
}
