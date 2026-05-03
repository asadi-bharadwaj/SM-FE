package com.sm.profile.web;

import com.sm.profile.client.SocialServiceClient;
import com.sm.profile.client.UserCountsDto;
import com.sm.profile.domain.Profile;
import com.sm.profile.domain.ProfileRepository;
import com.sm.profile.web.dto.PublicUserDto;
import com.sm.profile.web.dto.UpdateProfileRequest;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

  private final ProfileRepository profileRepository;
  private final SocialServiceClient socialServiceClient;

  public ProfileService(
      ProfileRepository profileRepository, SocialServiceClient socialServiceClient) {
    this.profileRepository = profileRepository;
    this.socialServiceClient = socialServiceClient;
  }

  public PublicUserDto getMe(Long userId) {
    Profile p =
        profileRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    return toDto(p, true);
  }

  public List<PublicUserDto> listAll() {
    return profileRepository.findAll().stream()
        .map(p -> toDto(p, true))
        .collect(Collectors.toList());
  }

  public PublicUserDto update(Long userId, UpdateProfileRequest req) {
    Optional<Profile> existing = profileRepository.findById(userId);
    if (existing.isEmpty()) {
      return createProfileIfMissing(userId, req);
    }

    Profile p = existing.get();

    if (req.getDisplayName() != null) {
      p.setDisplayName(req.getDisplayName());
    }
    if (req.getBio() != null) {
      p.setBio(req.getBio());
    }
    if (req.getCountry() != null) {
      p.setCountry(req.getCountry());
    }
    if (req.getLanguage() != null) {
      p.setLanguage(req.getLanguage());
    }
    if (req.getAvatarUrl() != null) {
      p.setAvatarUrl(req.getAvatarUrl());
    }
    if (req.getWebsite() != null) {
      p.setWebsite(req.getWebsite());
    }

    profileRepository.save(p);
    return toDto(p, true);
  }

  /**
   * Creates a profile document when internal provisioning failed or the user is new to this DB.
   */
  private PublicUserDto createProfileIfMissing(Long userId, UpdateProfileRequest req) {
    if (req.getUsername() == null || req.getUsername().isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "username is required to create a profile");
    }
    String uname = req.getUsername().trim();
    profileRepository
        .findByUsernameIgnoreCase(uname)
        .filter(o -> !o.getUserId().equals(userId))
        .ifPresent(
            o -> {
              throw new ResponseStatusException(HttpStatus.CONFLICT, "Username taken");
            });

    Profile p = new Profile();
    p.setUserId(userId);
    p.setUsername(uname);
    if (req.getDisplayName() != null && !req.getDisplayName().isBlank()) {
      p.setDisplayName(req.getDisplayName().trim());
    } else {
      p.setDisplayName(uname);
    }
    if (req.getBio() != null) {
      p.setBio(req.getBio());
    }
    if (req.getCountry() != null) {
      p.setCountry(req.getCountry());
    }
    if (req.getLanguage() != null) {
      p.setLanguage(req.getLanguage());
    }
    if (req.getAvatarUrl() != null) {
      p.setAvatarUrl(req.getAvatarUrl());
    }
    if (req.getWebsite() != null) {
      p.setWebsite(req.getWebsite());
    }
    if (p.getBio() == null) {
      p.setBio("");
    }

    profileRepository.save(p);
    return toDto(p, true);
  }

  public Optional<PublicUserDto> findByUsername(String username) {
    return profileRepository.findByUsernameIgnoreCase(username).map(p -> toDto(p, true));
  }

  public PublicUserDto getPublic(Long userId, boolean includeCounts) {
    Profile p =
        profileRepository
            .findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
    return toDto(p, includeCounts);
  }

  public PublicUserDto provision(Long userId, String username, String displayName) {
    if (profileRepository.existsById(userId)) {
      return getPublic(userId, true);
    }
    Profile p = new Profile();
    p.setUserId(userId);
    p.setUsername(username.trim());
    p.setDisplayName(displayName != null ? displayName.trim() : username.trim());
    p.setBio("");
    profileRepository.save(p);
    return toDto(p, true);
  }

  private PublicUserDto toDto(Profile p, boolean includeCounts) {
    PublicUserDto d = new PublicUserDto();
    d.setId(String.valueOf(p.getUserId()));
    d.setUsername(p.getUsername());
    d.setDisplayName(Optional.ofNullable(p.getDisplayName()).orElse(p.getUsername()));
    d.setAvatarUrl(p.getAvatarUrl());
    d.setBio(Optional.ofNullable(p.getBio()).orElse(""));
    d.setCountry(p.getCountry());
    d.setLanguage(p.getLanguage());
    d.setWebsite(p.getWebsite());
    d.setLink(p.getWebsite());

    if (includeCounts && p.getUserId() != null) {
      UserCountsDto c = socialServiceClient.getCounts(p.getUserId());
      d.setSubscriberCount(c.getSubscriberCount());
      d.setFollowingCount(c.getFollowingCount());
    }

    return d;
  }
}
