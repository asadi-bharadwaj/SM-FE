package com.sm.auth.config;

import com.sm.auth.domain.User;
import com.sm.auth.domain.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataLoader {

  @Bean
  CommandLineRunner seedUsers(UserRepository users, PasswordEncoder encoder) {
    return args -> {
      if (users.count() > 0) {
        return;
      }
      User alice = new User();
      alice.setId(1L);
      alice.setEmail("alice@demo.local");
      alice.setUsername("alice");
      alice.setDisplayName("Alice");
      alice.setPasswordHash(encoder.encode("password123"));
      users.save(alice);

      User bob = new User();
      bob.setId(2L);
      bob.setEmail("bob@demo.local");
      bob.setUsername("bob");
      bob.setDisplayName("Bob");
      bob.setPasswordHash(encoder.encode("password123"));
      users.save(bob);
    };
  }
}
