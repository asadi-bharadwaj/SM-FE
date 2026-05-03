package com.sm.content.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ProfileServiceClient {

  private static final Logger log = LoggerFactory.getLogger(ProfileServiceClient.class);

  private final RestTemplate restTemplate;
  private final String profileBaseUrl;

  public ProfileServiceClient(
      RestTemplate restTemplate,
      @Value("${profile.service.base-url:http://localhost:8082}") String profileBaseUrl) {
    this.restTemplate = restTemplate;
    this.profileBaseUrl = profileBaseUrl.replaceAll("/$", "");
  }

  public PublicUserDto getPublicProfile(long userId) {
    try {
      return restTemplate.getForObject(
          profileBaseUrl + "/users/public/" + userId, PublicUserDto.class);
    } catch (RestClientException e) {
      log.warn("Profile {} not available: {}", userId, e.getMessage());
      PublicUserDto stub = new PublicUserDto();
      stub.setId(String.valueOf(userId));
      stub.setUsername("user" + userId);
      stub.setDisplayName("User");
      return stub;
    }
  }
}
