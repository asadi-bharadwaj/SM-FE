package com.sm.profile.web.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PublicUserDto {

  private String id;
  private String username;
  private String displayName;
  private String avatarUrl;
  private String bio;
  private String country;
  private String language;
  private String website;
  private String link;
  private Long subscriberCount;
  private Long followingCount;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
  }

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getBio() {
    return bio;
  }

  public void setBio(String bio) {
    this.bio = bio;
  }

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public String getLanguage() {
    return language;
  }

  public void setLanguage(String language) {
    this.language = language;
  }

  public String getWebsite() {
    return website;
  }

  public void setWebsite(String website) {
    this.website = website;
  }

  public String getLink() {
    return link;
  }

  public void setLink(String link) {
    this.link = link;
  }

  public Long getSubscriberCount() {
    return subscriberCount;
  }

  public void setSubscriberCount(Long subscriberCount) {
    this.subscriberCount = subscriberCount;
  }

  public Long getFollowingCount() {
    return followingCount;
  }

  public void setFollowingCount(Long followingCount) {
    this.followingCount = followingCount;
  }
}
