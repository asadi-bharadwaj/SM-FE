package com.sm.content.web;

import com.sm.content.service.MediaStorageService;
import com.sm.content.service.PostWriteService;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
public class PostCreationController {

  private static final Logger log = LoggerFactory.getLogger(PostCreationController.class);

  private final MediaStorageService mediaStorageService;
  private final PostWriteService postWriteService;

  public PostCreationController(
      MediaStorageService mediaStorageService, PostWriteService postWriteService) {
    this.mediaStorageService = mediaStorageService;
    this.postWriteService = postWriteService;
  }

  @PostMapping(value = "/posts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<PostDto> createPost(
      @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
      @RequestPart("file") MultipartFile file,
      @RequestParam(value = "caption", required = false) String caption,
      @RequestParam(value = "visibility", required = false, defaultValue = "public")
          String visibility,
      @RequestParam(value = "tags", required = false) String tags) {

    long authorId = requireUserId(userIdHeader);
    PostWriteService.validateFile(file);

    String base =
        ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();

    String mediaUrl;
    try {
      mediaUrl = mediaStorageService.store(file, authorId, base);
    } catch (IOException e) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "Could not store upload: " + e.getMessage());
    }

    String mediaType = PostWriteService.mediaTypeFromContentType(file.getContentType());
    PostDto body =
        postWriteService.createPost(authorId, mediaUrl, mediaType, caption, visibility, tags);
    log.info(
        "Post created: id={} authorId={} mediaType={} sizeBytes={} mediaUrl={}",
        body.getId(),
        authorId,
        mediaType,
        file.getSize(),
        mediaUrl);
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  private static long requireUserId(String header) {
    if (header == null || header.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
    try {
      return Long.parseLong(header.trim());
    } catch (NumberFormatException e) {
      throw new ResponseStatusException(
          HttpStatus.UNAUTHORIZED, "Missing or invalid X-User-Id");
    }
  }
}
