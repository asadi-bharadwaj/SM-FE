package com.sm.content.web;

import com.sm.content.client.ProfileServiceClient;
import com.sm.content.client.PublicUserDto;
import com.sm.content.domain.PostEntity;
import com.sm.content.domain.PostRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PostQueryService {

  private final PostRepository postRepository;
  private final ProfileServiceClient profileClient;

  public PostQueryService(PostRepository postRepository, ProfileServiceClient profileClient) {
    this.postRepository = postRepository;
    this.profileClient = profileClient;
  }

  public List<PostDto> listByAuthor(long authorUserId) {
    PublicUserDto author = profileClient.getPublicProfile(authorUserId);
    List<PostDto> out = new ArrayList<>();
    for (PostEntity p : postRepository.findByAuthorIdOrderByCreatedAtDesc(authorUserId)) {
      out.add(toDto(p, author));
    }
    return out;
  }

  public PostDto getById(long postId) {
    PostEntity p =
        postRepository
            .findById(postId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
    PublicUserDto author = profileClient.getPublicProfile(p.getAuthorId());
    return toDto(p, author);
  }

  private PostDto toDto(PostEntity p, PublicUserDto author) {
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
}
