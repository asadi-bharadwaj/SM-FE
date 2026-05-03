package com.sm.auth.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ProfileProvisioningClient {

  private static final Logger log = LoggerFactory.getLogger(ProfileProvisioningClient.class);

  private final RestTemplate restTemplate;
  private final String profileBaseUrl;

  public ProfileProvisioningClient(
      RestTemplate restTemplate,
      @Value("${profile.service.base-url:http://localhost:8082}") String profileBaseUrl) {
    this.restTemplate = restTemplate;
    this.profileBaseUrl = profileBaseUrl.replaceAll("/$", "");
  }

  public void provision(long userId, String username, String displayName) {
    ProfileProvisionRequest body = new ProfileProvisionRequest();
    body.setUserId(userId);
    body.setUsername(username);
    body.setDisplayName(displayName);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<ProfileProvisionRequest> entity = new HttpEntity<>(body, headers);

    try {
      restTemplate.postForEntity(
          profileBaseUrl + "/internal/profiles", entity, Void.class);
    } catch (RestClientException e) {
      log.warn(
          "Could not provision profile at {} (is profile-service running?): {}",
          profileBaseUrl,
          e.getMessage());
    }
  }
}
