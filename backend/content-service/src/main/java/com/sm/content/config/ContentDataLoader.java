package com.sm.content.config;

import com.sm.content.domain.PostEntity;
import com.sm.content.domain.PostRepository;
import java.time.Instant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ContentDataLoader {

  @Bean
  CommandLineRunner seedPosts(PostRepository posts) {
    return args -> {
      if (posts.count() > 0) {
        return;
      }
      samplePost(posts, 1L, 1L, "https://picsum.photos/seed/sm-a1/800/800", "Hello world");
      samplePost(posts, 2L, 1L, "https://picsum.photos/seed/sm-a2/800/800", "Second post");
      samplePost(posts, 3L, 2L, "https://picsum.photos/seed/sm-b1/800/800", "Bob's shot");
    };
  }

  private static void samplePost(
      PostRepository posts, Long id, Long authorId, String url, String caption) {
    PostEntity p = new PostEntity();
    p.setId(id);
    p.setAuthorId(authorId);
    p.setMediaUrl(url);
    p.setMediaType("image");
    p.setCaption(caption);
    p.setCreatedAt(Instant.now());
    p.setVisibility("public");
    p.setTags("");
    posts.save(p);
  }
}
