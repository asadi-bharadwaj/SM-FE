package com.sm.content.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PostByIdController {

  private final PostQueryService postQueryService;

  public PostByIdController(PostQueryService postQueryService) {
    this.postQueryService = postQueryService;
  }

  @GetMapping("/posts/{postId}")
  public PostDto getOne(@PathVariable Long postId) {
    return postQueryService.getById(postId);
  }
}
