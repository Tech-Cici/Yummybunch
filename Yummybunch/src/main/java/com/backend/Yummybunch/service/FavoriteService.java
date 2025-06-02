package com.backend.Yummybunch.service;

import com.backend.Yummybunch.model.Favorite;
import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.model.User;
import com.backend.Yummybunch.repository.FavoriteRepository;
import com.backend.Yummybunch.repository.RestaurantRepository;
import com.backend.Yummybunch.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RestaurantDTO> getFavorites(String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteRepository.findByUser(user).stream()
                .map(favorite -> {
                    Restaurant restaurant = favorite.getRestaurant();
                    return new RestaurantDTO(
                        restaurant.getId(),
                        restaurant.getName(),
                        restaurant.getCuisineType(),
                        restaurant.getAddress(),
                        restaurant.getPhoneNumber(),
                        restaurant.getImageUrl(),
                        restaurant.getRating(),
                        restaurant.getDescription(),
                        restaurant.getOpeningHours(),
                        restaurant.getMinimumOrderAmount(),
                        restaurant.getIsVerified()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(String username, Long restaurantId) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        return favoriteRepository.existsByUserAndRestaurant(user, restaurant);
    }

    @Transactional
    public boolean toggleFavorite(String username, Long restaurantId) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Optional<Favorite> existingFavorite = favoriteRepository.findByUserAndRestaurant(user, restaurant);
        
        if (existingFavorite.isPresent()) {
            favoriteRepository.delete(existingFavorite.get());
            return false;
        } else {
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setRestaurant(restaurant);
            favorite.setActive(true);
            favoriteRepository.save(favorite);
            return true;
        }
    }

    // DTO class to avoid JSON serialization issues
    public static class RestaurantDTO {
        private Long id;
        private String name;
        private String cuisineType;
        private String address;
        private String phoneNumber;
        private String imageUrl;
        private Double rating;
        private String description;
        private String openingHours;
        private Double minimumOrderAmount;
        private Boolean isVerified;

        public RestaurantDTO(Long id, String name, String cuisineType, String address, 
                           String phoneNumber, String imageUrl, Double rating, 
                           String description, String openingHours, Double minimumOrderAmount,
                           Boolean isVerified) {
            this.id = id;
            this.name = name;
            this.cuisineType = cuisineType;
            this.address = address;
            this.phoneNumber = phoneNumber;
            this.imageUrl = imageUrl;
            this.rating = rating;
            this.description = description;
            this.openingHours = openingHours;
            this.minimumOrderAmount = minimumOrderAmount;
            this.isVerified = isVerified;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getCuisineType() { return cuisineType; }
        public String getAddress() { return address; }
        public String getPhoneNumber() { return phoneNumber; }
        public String getImageUrl() { return imageUrl; }
        public Double getRating() { return rating; }
        public String getDescription() { return description; }
        public String getOpeningHours() { return openingHours; }
        public Double getMinimumOrderAmount() { return minimumOrderAmount; }
        public Boolean getIsVerified() { return isVerified; }
    }
} 