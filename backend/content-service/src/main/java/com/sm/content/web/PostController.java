package com.sm.content.web;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class PostController {

  private final PostQueryService postQueryService;

  public PostController(PostQueryService postQueryService) {
    this.postQueryService = postQueryService;
  }

  @GetMapping("/{userId}/posts")
  public List<PostDto> posts(@PathVariable Long userId) {
    return postQueryService.listByAuthor(userId);
  }
}
