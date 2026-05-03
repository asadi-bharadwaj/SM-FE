package com.sm.content.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

  @Value("${content.upload.directory:./data/uploads}")
  private String uploadDirectory;

  /** Saves the file and returns the stored file name (under /media/). */
  public String store(MultipartFile file) throws IOException {
    Path dir = Paths.get(uploadDirectory).toAbsolutePath().normalize();
    Files.createDirectories(dir);

    String ext = resolveExtension(file);
    String name = UUID.randomUUID() + ext;
    Path target = dir.resolve(name);
    file.transferTo(target);
    return name;
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
