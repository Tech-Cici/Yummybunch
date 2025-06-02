package com.backend.Yummybunch.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.context.annotation.Bean;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.File;

@Configuration
public class FileStorageConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageConfig.class);

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    private Path uploadPath;
    private Path menusPath;
    private Path restaurantsPath;
    private Path tempPath;

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            // Get the absolute path to the uploads directory
            String userDir = System.getProperty("user.dir");
            uploadPath = Paths.get(userDir, uploadDir).toAbsolutePath().normalize();
            
            // Create the uploads directory if it doesn't exist
            createDirectoryIfNotExists(uploadPath.toFile());
            
            // Create subdirectories
            menusPath = uploadPath.resolve("menus");
            restaurantsPath = uploadPath.resolve("restaurants");
            tempPath = uploadPath.resolve("temp");
            
            createDirectoryIfNotExists(menusPath.toFile());
            createDirectoryIfNotExists(restaurantsPath.toFile());
            createDirectoryIfNotExists(tempPath.toFile());

            // Set the system's temporary directory for file uploads
            System.setProperty("java.io.tmpdir", tempPath.toString());
            
            logger.info("Initialized upload directories:");
            logger.info("Upload path: {}", uploadPath);
            logger.info("Menus path: {}", menusPath);
            logger.info("Restaurants path: {}", restaurantsPath);
            logger.info("Temp path: {}", tempPath);

            // Register resource handlers
            registry.addResourceHandler("/uploads/**")
                    .addResourceLocations("file:" + uploadPath.toString() + "/");
            
            logger.info("Registered resource handler for path: /uploads/**");
        } catch (Exception e) {
            logger.error("Failed to initialize file storage configuration", e);
            throw new RuntimeException("Failed to initialize file storage configuration", e);
        }
    }

    private void createDirectoryIfNotExists(File directory) {
        if (!directory.exists()) {
            boolean created = directory.mkdirs();
            if (created) {
                logger.info("Created directory: {}", directory.getAbsolutePath());
            } else {
                logger.error("Failed to create directory: {}", directory.getAbsolutePath());
                throw new RuntimeException("Failed to create directory: " + directory.getAbsolutePath());
            }
        } else {
            logger.info("Directory already exists: {}", directory.getAbsolutePath());
        }
    }

    public Path getUploadPath() {
        return uploadPath;
    }

    public Path getMenusPath() {
        return menusPath;
    }

    public Path getRestaurantsPath() {
        return restaurantsPath;
    }

    public Path getTempPath() {
        return tempPath;
    }
} 