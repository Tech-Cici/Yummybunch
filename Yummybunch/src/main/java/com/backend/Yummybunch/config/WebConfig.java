package com.backend.Yummybunch.config;

import com.backend.Yummybunch.service.StorageService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves uploaded images back over HTTP at /uploads/**.
 *
 * Deliberately NOT annotated with @EnableWebMvc: that switches off Spring Boot's
 * WebMvc auto-configuration, which silently discards every spring.jackson.*
 * property and made LocalDateTime serialise as an array the browser cannot parse.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final StorageService storage;

    public WebConfig(StorageService storage) {
        this.storage = storage;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(storage.root().toUri().toString())
                .setCachePeriod(3600);
    }
}
