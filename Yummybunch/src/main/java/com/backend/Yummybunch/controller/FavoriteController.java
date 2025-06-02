package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.service.FavoriteService;
import com.backend.Yummybunch.service.FavoriteService.RestaurantDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<RestaurantDTO>> getFavorites(Authentication authentication) {
        try {
            List<RestaurantDTO> favorites = favoriteService.getFavorites(authentication.getName());
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{restaurantId}")
    public ResponseEntity<Boolean> isFavorite(
            Authentication authentication,
            @PathVariable Long restaurantId) {
        try {
            boolean isFavorite = favoriteService.isFavorite(authentication.getName(), restaurantId);
            return ResponseEntity.ok(isFavorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{restaurantId}")
    public ResponseEntity<Boolean> toggleFavorite(
            Authentication authentication,
            @PathVariable Long restaurantId) {
        try {
            boolean isNowFavorite = favoriteService.toggleFavorite(authentication.getName(), restaurantId);
            return ResponseEntity.ok(isNowFavorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 