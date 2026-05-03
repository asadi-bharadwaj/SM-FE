package com.sm.profile.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class SocialServiceClient {

  private static final Logger log = LoggerFactory.getLogger(SocialServiceClient.class);

  private final RestTemplate restTemplate;
  private final String socialBaseUrl;

  public SocialServiceClient(
      RestTemplate restTemplate,
      @Value("${social.service.base-url:http://localhost:8083}") String socialBaseUrl) {
    this.restTemplate = restTemplate;
    this.socialBaseUrl = socialBaseUrl.replaceAll("/$", "");
  }

  public UserCountsDto getCounts(long userId) {
    try {
      return restTemplate.getForObject(
          socialBaseUrl + "/counts/" + userId, UserCountsDto.class);
    } catch (RestClientException e) {
      log.debug("Social counts unavailable for {}: {}", userId, e.getMessage());
      UserCountsDto z = new UserCountsDto();
      z.setSubscriberCount(0);
      z.setFollowingCount(0);
      return z;
    }
  }
}
