package com.sm.social.web;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class SocialController {

  private final SocialService socialService;

  public SocialController(SocialService socialService) {
    this.socialService = socialService;
  }

  /** Avoids clash with {@code /users/followers}. */
  @GetMapping("/counts/{userId}")
  public UserCountsDto counts(@PathVariable Long userId) {
    return socialService.counts(userId);
  }

  @GetMapping("/users/followers")
  public List<FollowerEntryDto> followers(
      @RequestHeader(value = "X-User-Id", required = false) String profileUserIdHeader) {
    Long profileId = requireUserId(profileUserIdHeader);
    return socialService.listFollowers(profileId);
  }

  @GetMapping("/users/following")
  public List<FollowingEntryDto> following(
      @RequestHeader(value = "X-User-Id", required = false) String profileUserIdHeader) {
    Long profileId = requireUserId(profileUserIdHeader);
    return socialService.listFollowing(profileId);
  }

  @PostMapping("/users/follow/{creatorId}")
  public ResponseEntity<Void> follow(
      @RequestHeader(value = "X-User-Id", required = false) String subscriberHeader,
      @PathVariable Long creatorId) {
    Long subscriberId = requireUserId(subscriberHeader);
    socialService.follow(subscriberId, creatorId);
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/users/follow/{creatorId}")
  public ResponseEntity<Void> unfollow(
      @RequestHeader(value = "X-User-Id", required = false) String subscriberHeader,
      @PathVariable Long creatorId) {
    Long subscriberId = requireUserId(subscriberHeader);
    socialService.unfollow(subscriberId, creatorId);
    return ResponseEntity.ok().build();
  }

  private static Long requireUserId(String header) {
    if (header == null || header.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
    try {
      return Long.parseLong(header.trim());
    } catch (NumberFormatException e) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
  }
}
