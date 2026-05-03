package com.sm.content.web.dto;

import com.sm.content.client.PublicUserDto;
import java.util.ArrayList;
import java.util.List;

public class LikersResponse {

  private List<PublicUserDto> users = new ArrayList<>();

  public List<PublicUserDto> getUsers() {
    return users;
  }

  public void setUsers(List<PublicUserDto> users) {
    this.users = users;
  }
}
