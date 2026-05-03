package com.sm.social.config;

import com.sm.social.domain.Follow;
import com.sm.social.domain.FollowRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocialDataLoader {

  @Bean
  CommandLineRunner seedFollows(FollowRepository follows) {
    return args -> {
      if (follows.count() > 0) {
        return;
      }
      Follow f = new Follow();
      f.setId(1L);
      f.setFollowerId(2L);
      f.setFollowingId(1L);
      follows.save(f);
    };
  }
}
