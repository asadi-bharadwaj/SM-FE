package com.sm.profile.web.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

  /** Required when creating a profile via PUT /users/me (no row yet). Ignored on update. */
  @Size(min = 2, max = 50)
  private String username;

  @Size(max = 200)
  private String displayName;

  @Size(max = 2000)
  private String bio;

  @Size(max = 100)
  private String country;

  @Size(max = 50)
  private String language;

  @Size(max = 2048)
  private String avatarUrl;

  @Size(max = 500)
  private String website;

  public String getDisplayName() {
    return displayName;
  }

  public void setDisplayName(String displayName) {
    this.displayName = displayName;
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

  public String getAvatarUrl() {
    return avatarUrl;
  }

  public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
  }

  public String getWebsite() {
    return website;
  }

  public void setWebsite(String website) {
    this.website = website;
  }

  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }
}
