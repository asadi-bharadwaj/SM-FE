package com.sm.content.web;

import com.sm.content.web.dto.CommentBody;
import com.sm.content.web.dto.CommentResponse;
import com.sm.content.web.dto.EngagementResponse;
import com.sm.content.web.dto.LikersResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/posts")
public class PostsRestController {

  private final PostQueryService postQueryService;
  private final PostEngagementService engagementService;

  public PostsRestController(PostQueryService postQueryService, PostEngagementService engagementService) {
    this.postQueryService = postQueryService;
    this.engagementService = engagementService;
  }

  @GetMapping("/{postId}")
  public PostDto getPost(@PathVariable long postId) {
    return postQueryService.getById(postId);
  }

  @GetMapping("/{postId}/engagement")
  public EngagementResponse engagement(
      @PathVariable long postId,
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
    return engagementService.getEngagement(postId, parseOptionalLong(userIdHeader));
  }

  @GetMapping("/{postId}/likes")
  public LikersResponse likers(
      @PathVariable long postId,
      @RequestParam(defaultValue = "50") int limit) {
    return engagementService.listLikers(postId, limit);
  }

  @PostMapping("/{postId}/likes")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void like(
      @PathVariable long postId, @RequestHeader("X-User-Id") String userIdHeader) {
    long uid = requireUserId(userIdHeader);
    engagementService.like(postId, uid);
  }

  @DeleteMapping("/{postId}/likes")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void unlike(
      @PathVariable long postId, @RequestHeader("X-User-Id") String userIdHeader) {
    long uid = requireUserId(userIdHeader);
    engagementService.unlike(postId, uid);
  }

  @PostMapping("/{postId}/comments")
  public CommentResponse addComment(
      @PathVariable long postId,
      @RequestHeader("X-User-Id") String userIdHeader,
      @Valid @RequestBody CommentBody body) {
    long uid = requireUserId(userIdHeader);
    return engagementService.addComment(postId, uid, body.getText());
  }

  @PostMapping("/{postId}/saved")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void savePost(
      @PathVariable long postId, @RequestHeader("X-User-Id") String userIdHeader) {
    long uid = requireUserId(userIdHeader);
    engagementService.savePost(postId, uid);
  }

  @DeleteMapping("/{postId}/saved")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void unsavePost(
      @PathVariable long postId, @RequestHeader("X-User-Id") String userIdHeader) {
    long uid = requireUserId(userIdHeader);
    engagementService.unsavePost(postId, uid);
  }

  private static Long parseOptionalLong(String raw) {
    if (raw == null || raw.isBlank()) {
      return null;
    }
    try {
      return Long.parseLong(raw.trim());
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private static long requireUserId(String header) {
    Long id = parseOptionalLong(header);
    if (id == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "X-User-Id required");
    }
    return id;
  }
}
