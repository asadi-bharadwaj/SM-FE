package com.sm.chat.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "conversations")
@CompoundIndex(name = "uniq_conv_pair", def = "{'userA': 1, 'userB': 1}", unique = true)
public class Conversation {

  @Id private Long id;

  private Long userA;
  private Long userB;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getUserA() {
    return userA;
  }

  public void setUserA(Long userA) {
    this.userA = userA;
  }

  public Long getUserB() {
    return userB;
  }

  public void setUserB(Long userB) {
    this.userB = userB;
  }

  public static long[] normalizePair(long u1, long u2) {
    if (u1 == u2) {
      throw new IllegalArgumentException("Cannot chat with yourself");
    }
    return u1 < u2 ? new long[] {u1, u2} : new long[] {u2, u1};
  }

  public static long otherParticipant(long userId, Conversation c) {
    if (c.getUserA().equals(userId)) {
      return c.getUserB();
    }
    if (c.getUserB().equals(userId)) {
      return c.getUserA();
    }
    throw new IllegalArgumentException("User not in conversation");
  }
}
