package com.sm.profile.config;

import com.sm.profile.domain.Profile;
import com.sm.profile.domain.ProfileRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ProfileDataLoader {

  @Bean
  CommandLineRunner seedProfiles(ProfileRepository profiles) {
    return args -> {
      if (profiles.count() > 0) {
        return;
      }
      Profile alice = new Profile();
      alice.setUserId(1L);
      alice.setUsername("alice");
      alice.setDisplayName("Alice");
      alice.setBio("Creator · demo account");
      alice.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Alice");
      profiles.save(alice);

      Profile bob = new Profile();
      bob.setUserId(2L);
      bob.setUsername("bob");
      bob.setDisplayName("Bob");
      bob.setBio("Photographer");
      bob.setAvatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=Bob");
      profiles.save(bob);
    };
  }
}
