package com.backend.Yummybunch.service;

import com.backend.Yummybunch.web.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class StorageService {

    private static final List<String> ALLOWED = List.of("jpg", "jpeg", "png", "webp", "gif");
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Path root;

    public StorageService(@Value("${file.upload-dir:uploads}") String dir) {
        this.root = Paths.get(dir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory " + root, e);
        }
    }

    /**
     * Stores an image and returns the public path (e.g. {@code /uploads/ab12.jpg}).
     * The extension is validated and the name is generated, so a caller cannot
     * choose the path or smuggle in a traversal sequence.
     */
    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No file was uploaded");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "Images must be 5 MB or smaller");
        }

        String ext = extensionOf(file.getOriginalFilename());
        if (!ALLOWED.contains(ext)) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Unsupported image type. Use JPG, PNG, WEBP or GIF.");
        }

        String name = UUID.randomUUID() + "." + ext;
        try {
            Files.copy(file.getInputStream(), root.resolve(name), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not save the image");
        }
        return "/uploads/" + name;
    }

    public void deleteByPublicPath(String publicPath) {
        if (publicPath == null || !publicPath.startsWith("/uploads/")) return;
        String name = publicPath.substring("/uploads/".length());
        // Reject anything that is not a bare filename.
        if (name.contains("/") || name.contains("..")) return;
        try {
            Files.deleteIfExists(root.resolve(name));
        } catch (IOException ignored) {
            // A missing or locked file must not break the surrounding update.
        }
    }

    public Path root() {
        return root;
    }

    private static String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
