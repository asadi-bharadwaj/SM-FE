package com.sm.profile.domain;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile, Long> {

  Optional<Profile> findByUsernameIgnoreCase(String username);
}
