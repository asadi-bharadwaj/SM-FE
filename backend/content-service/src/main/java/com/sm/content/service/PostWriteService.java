package com.sm.content.service;

import com.sm.content.client.ProfileServiceClient;
import com.sm.content.client.PublicUserDto;
import com.sm.content.domain.PostEntity;
import com.sm.content.domain.PostRepository;
import com.sm.content.web.PostDto;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostWriteService {

  private final PostRepository postRepository;
  private final ProfileServiceClient profileServiceClient;

  public PostWriteService(
      PostRepository postRepository, ProfileServiceClient profileServiceClient) {
    this.postRepository = postRepository;
    this.profileServiceClient = profileServiceClient;
  }

  public PostDto createPost(
      long authorId,
      String mediaUrl,
      String mediaType,
      String caption,
      String visibility,
      String tagsRaw) {

    String vis = normalizeVisibility(visibility);
    PostEntity p = new PostEntity();
    p.setId(nextId());
    p.setAuthorId(authorId);
    p.setMediaUrl(mediaUrl);
    p.setMediaType(mediaType);
    p.setCaption(caption != null ? caption : "");
    p.setCreatedAt(Instant.now());
    p.setVisibility(vis);
    p.setTags(normalizeTags(tagsRaw));

    postRepository.save(p);

    PublicUserDto author = profileServiceClient.getPublicProfile(authorId);
    return toDto(p, author);
  }

  private long nextId() {
    return postRepository.findFirstByOrderByIdDesc().map(PostEntity::getId).map(id -> id + 1).orElse(1L);
  }

  private static String normalizeVisibility(String v) {
    if (v == null || v.isBlank()) {
      return "public";
    }
    String s = v.trim().toLowerCase();
    if ("public".equals(s) || "subscribers".equals(s) || "tier".equals(s)) {
      return s;
    }
    return "public";
  }

  private static String normalizeTags(String raw) {
    if (raw == null || raw.isBlank()) {
      return "";
    }
    return raw.trim();
  }

  private static PostDto toDto(PostEntity p, PublicUserDto author) {
    PostDto dto = new PostDto();
    dto.setId(String.valueOf(p.getId()));
    dto.setAuthorId(String.valueOf(p.getAuthorId()));
    dto.setAuthor(author);
    dto.setMediaUrl(p.getMediaUrl());
    dto.setMediaType(p.getMediaType());
    dto.setCaption(p.getCaption() != null ? p.getCaption() : "");
    dto.setCreatedAt(p.getCreatedAt());
    dto.setVisibility(p.getVisibility());
    dto.setTags(parseTags(p.getTags()));
    return dto;
  }

  private static List<String> parseTags(String raw) {
    if (raw == null || raw.isBlank()) {
      return List.of();
    }
    return Arrays.stream(raw.split(",")).map(String::trim).filter(s -> !s.isEmpty()).collect(Collectors.toList());
  }

  public static String mediaTypeFromContentType(String contentType) {
    if (contentType != null && contentType.toLowerCase().startsWith("video/")) {
      return "video";
    }
    return "image";
  }

  public static void validateFile(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A media file is required");
    }
    String ct = file.getContentType();
    if (ct == null) {
      return;
    }
    String lower = ct.toLowerCase();
    boolean ok =
        lower.startsWith("image/")
            || lower.startsWith("video/")
            || lower.equals("application/octet-stream");
    if (!ok) {
      throw new ResponseStatusException(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only image or video uploads are allowed");
    }
  }
}
