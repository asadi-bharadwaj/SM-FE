package com.sm.social.web;

import com.sm.social.domain.Follow;
import com.sm.social.domain.FollowRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SocialService {

  private final FollowRepository followRepository;

  public SocialService(FollowRepository followRepository) {
    this.followRepository = followRepository;
  }

  public UserCountsDto counts(Long profileUserId) {
    long subs = followRepository.findByFollowingId(profileUserId).size();
    long following = followRepository.findByFollowerId(profileUserId).size();
    return new UserCountsDto(subs, following);
  }

  public List<FollowerEntryDto> listFollowers(Long profileUserId) {
    return followRepository.findByFollowingId(profileUserId).stream()
        .map(f -> new FollowerEntryDto(String.valueOf(f.getFollowerId())))
        .collect(Collectors.toList());
  }

  public List<FollowingEntryDto> listFollowing(Long profileUserId) {
    return followRepository.findByFollowerId(profileUserId).stream()
        .map(f -> new FollowingEntryDto(String.valueOf(f.getFollowingId())))
        .collect(Collectors.toList());
  }

  public void follow(Long subscriberUserId, Long creatorUserId) {
    if (subscriberUserId.equals(creatorUserId)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot follow yourself");
    }
    if (followRepository.existsByFollowerIdAndFollowingId(subscriberUserId, creatorUserId)) {
      return;
    }
    Follow f = new Follow();
    f.setId(nextFollowId());
    f.setFollowerId(subscriberUserId);
    f.setFollowingId(creatorUserId);
    followRepository.save(f);
  }

  private long nextFollowId() {
    return followRepository.findAll().stream().mapToLong(Follow::getId).max().orElse(0L) + 1;
  }

  public void unfollow(Long subscriberUserId, Long creatorUserId) {
    followRepository.deleteByFollowerIdAndFollowingId(subscriberUserId, creatorUserId);
  }
}
