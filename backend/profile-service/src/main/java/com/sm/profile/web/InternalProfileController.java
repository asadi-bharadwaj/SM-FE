package com.sm.profile.web;

import com.sm.profile.web.dto.ProvisionProfileRequest;
import com.sm.profile.web.dto.PublicUserDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal")
public class InternalProfileController {

  private final ProfileService profileService;

  public InternalProfileController(ProfileService profileService) {
    this.profileService = profileService;
  }

  @PostMapping("/profiles")
  public ResponseEntity<PublicUserDto> provision(@Valid @RequestBody ProvisionProfileRequest body) {
    PublicUserDto dto =
        profileService.provision(body.getUserId(), body.getUsername(), body.getDisplayName());
    return ResponseEntity.ok(dto);
  }
}
