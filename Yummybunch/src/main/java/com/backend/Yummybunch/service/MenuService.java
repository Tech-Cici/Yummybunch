package com.backend.Yummybunch.service;

import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class MenuService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    private final Path menuUploadDir = Paths.get("uploads/menus");

    public MenuService() {
        try {
            Files.createDirectories(menuUploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    public String uploadPdfMenu(Long restaurantId, MultipartFile file) throws IOException {
        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        String fileName = UUID.randomUUID().toString() + ".pdf";
        Path filePath = menuUploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Update restaurant with menu URL
        restaurant.setMenuUrl("/uploads/menus/" + fileName);
        restaurantRepository.save(restaurant);

        return restaurant.getMenuUrl();
    }

    public String getPdfMenuUrl(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (restaurant.getMenuUrl() == null) {
            throw new RuntimeException("No menu uploaded yet");
        }

        return restaurant.getMenuUrl();
    }

    public String uploadImageMenu(Long restaurantId, MultipartFile file) throws IOException {
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        String fileName = UUID.randomUUID().toString() + getFileExtension(file.getOriginalFilename());
        Path filePath = menuUploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        // Update restaurant with menu image URL
        restaurant.setMenuImageUrl("/uploads/menus/" + fileName);
        restaurantRepository.save(restaurant);

        return restaurant.getMenuImageUrl();
    }

    public String getImageMenuUrl(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (restaurant.getMenuImageUrl() == null) {
            throw new RuntimeException("No menu image uploaded yet");
        }

        return restaurant.getMenuImageUrl();
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int lastDotIndex = fileName.lastIndexOf(".");
        return lastDotIndex == -1 ? "" : fileName.substring(lastDotIndex);
    }
} 