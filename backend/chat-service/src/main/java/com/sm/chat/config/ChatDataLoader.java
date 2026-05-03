package com.sm.chat.config;

import com.sm.chat.domain.ChatMessageEntity;
import com.sm.chat.domain.ChatMessageRepository;
import com.sm.chat.domain.Conversation;
import com.sm.chat.domain.ConversationRepository;
import java.time.Instant;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ChatDataLoader {

  @Bean
  CommandLineRunner seedDemoChat(
      ConversationRepository conversations, ChatMessageRepository messages) {
    return args -> {
      if (conversations.count() > 0) {
        return;
      }
      long[] pair = Conversation.normalizePair(1L, 2L);
      Conversation c = new Conversation();
      c.setId(1L);
      c.setUserA(pair[0]);
      c.setUserB(pair[1]);
      conversations.save(c);

      ChatMessageEntity m1 = new ChatMessageEntity();
      m1.setId(1L);
      m1.setConversationId(c.getId());
      m1.setSenderId(1L);
      m1.setBody("Hey! Thanks for connecting.");
      m1.setCreatedAt(Instant.now().minusSeconds(3600));
      messages.save(m1);

      ChatMessageEntity m2 = new ChatMessageEntity();
      m2.setId(2L);
      m2.setConversationId(c.getId());
      m2.setSenderId(2L);
      m2.setBody("Looking forward to your posts.");
      m2.setCreatedAt(Instant.now().minusSeconds(1800));
      messages.save(m2);
    };
  }
}
