package com.sm.content.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

/**
 * Uploads media to S3 when {@code aws.s3.bucket} is set, otherwise to local {@code
 * content.upload.directory} and serves via /media/**.
 */
@Service
public class MediaStorageService {

  @Value("${aws.s3.bucket:}")
  private String s3Bucket;

  @Value("${aws.s3.region:eu-north-1}")
  private String s3Region;

  @Value("${content.upload.directory:./data/uploads}")
  private String uploadDirectory;

  private volatile S3Client s3Client;

  /**
   * @param httpOriginBase e.g. http://localhost:8084 (no trailing slash) for local storage URL
   *     building
   * @return full public URL to the object
   */
  public String store(MultipartFile file, long authorId, String httpOriginBase) throws IOException {
    String ext = resolveExtension(file);
    String name = UUID.randomUUID() + ext;
    String key = "posts/" + authorId + "/" + name;

    if (StringUtils.hasText(s3Bucket)) {
      S3Client s3 = s3();
      String contentType =
          file.getContentType() != null ? file.getContentType() : "application/octet-stream";
      PutObjectRequest put =
          PutObjectRequest.builder()
              .bucket(s3Bucket)
              .key(key)
              .contentType(contentType)
              .contentLength(file.getSize())
              .build();
      s3.putObject(put, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
      return virtualHostedStylePublicUrl(key);
    }

    Path dir = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    Files.createDirectories(dir);
    Path target = dir.resolve(name);
    file.transferTo(target);

    String base = httpOriginBase.endsWith("/") ? httpOriginBase.substring(0, httpOriginBase.length() - 1) : httpOriginBase;
    return base + "/media/" + name;
  }

  private S3Client s3() {
    if (s3Client == null) {
      synchronized (this) {
        if (s3Client == null) {
          s3Client =
              S3Client.builder()
                  .region(Region.of(s3Region))
                  .credentialsProvider(DefaultCredentialsProvider.create())
                  .build();
        }
      }
    }
    return s3Client;
  }

  /** HTTPS URL for object (requires bucket policy or Object Ownership for public reads if needed). */
  private String virtualHostedStylePublicUrl(String key) {
    return "https://" + s3Bucket + ".s3." + s3Region + ".amazonaws.com/" + key;
  }

  private static String resolveExtension(MultipartFile file) {
    String original = file.getOriginalFilename();
    if (original != null && original.contains(".")) {
      String ext = original.substring(original.lastIndexOf('.')).toLowerCase();
      if (ext.length() <= 10 && ext.matches("\\.[a-z0-9]+")) {
        return ext;
      }
    }
    String ct = file.getContentType();
    if (ct != null) {
      if (ct.contains("jpeg") || ct.contains("jpg")) return ".jpg";
      if (ct.contains("png")) return ".png";
      if (ct.contains("gif")) return ".gif";
      if (ct.contains("webp")) return ".webp";
      if (ct.contains("mp4")) return ".mp4";
      if (ct.contains("webm")) return ".webm";
      if (ct.contains("quicktime")) return ".mov";
    }
    return ".bin";
  }
}
