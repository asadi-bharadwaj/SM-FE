package com.sm.content.config;

import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  @Value("${content.upload.directory:./data/uploads}")
  private String uploadDirectory;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    Path dir = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    String location = dir.toUri().toString();
    if (!location.endsWith("/")) {
      location += "/";
    }
    registry.addResourceHandler("/media/**").addResourceLocations(location);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/**")
        .allowedOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*");
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
