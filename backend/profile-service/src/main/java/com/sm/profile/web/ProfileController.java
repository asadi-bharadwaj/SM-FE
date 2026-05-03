package com.sm.profile.web;

import com.sm.profile.web.dto.PublicUserDto;
import com.sm.profile.web.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/users")
public class ProfileController {

  private final ProfileService profileService;

  public ProfileController(ProfileService profileService) {
    this.profileService = profileService;
  }

  @GetMapping("/me")
  public ResponseEntity<PublicUserDto> getMe(
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
    Long id = requireUserId(userIdHeader);
    return ResponseEntity.ok(profileService.getMe(id));
  }

  @GetMapping("/all")
  public List<PublicUserDto> getAll() {
    return profileService.listAll();
  }

  @PutMapping("/me")
  public ResponseEntity<PublicUserDto> updateMe(
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
      @Valid @RequestBody UpdateProfileRequest body) {
    Long id = requireUserId(userIdHeader);
    return ResponseEntity.ok(profileService.update(id, body));
  }

  @GetMapping("/public/{userId}")
  public PublicUserDto getPublic(@PathVariable Long userId) {
    return profileService.getPublic(userId, true);
  }

  private static Long requireUserId(String header) {
    if (header == null || header.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
    try {
      return Long.parseLong(header.trim());
    } catch (NumberFormatException e) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
  }
}
