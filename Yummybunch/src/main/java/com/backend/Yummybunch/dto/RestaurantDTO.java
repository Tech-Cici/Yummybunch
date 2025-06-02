package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.model.Menu;
import lombok.Data;

import java.util.List;
import java.util.stream.Collectors;

@Data
public class RestaurantDTO {
    private Long id;
    private String name;
    private String description;
    private String address;
    private String phoneNumber;
    private String email;
    private String imageUrl;
    private String openingHours;
    private String closingHours;
    private String cuisineType;
    private Double rating;
    private Integer totalReviews;
    private Boolean isVerified;
    private Double minimumOrderAmount;
    private String deliveryRadius;
    private String paymentMethods;
    private String specialFeatures;
    private List<String> categories;
    private Long userId;
    private List<MenuDTO> menuItems;

    public static RestaurantDTO fromEntity(Restaurant restaurant) {
        if (restaurant == null) return null;
        
        RestaurantDTO dto = new RestaurantDTO();
        dto.setId(restaurant.getId());
        dto.setName(restaurant.getName());
        dto.setDescription(restaurant.getDescription());
        dto.setAddress(restaurant.getAddress());
        dto.setPhoneNumber(restaurant.getPhoneNumber());
        dto.setEmail(restaurant.getEmail());
        dto.setImageUrl(restaurant.getImageUrl());
        dto.setOpeningHours(restaurant.getOpeningHours());
        dto.setClosingHours(restaurant.getClosingHours());
        dto.setCuisineType(restaurant.getCuisineType());
        dto.setRating(restaurant.getRating());
        dto.setTotalReviews(restaurant.getTotalReviews());
        dto.setIsVerified(restaurant.getIsVerified());
        dto.setMinimumOrderAmount(restaurant.getMinimumOrderAmount());
        dto.setDeliveryRadius(restaurant.getDeliveryRadius());
        dto.setPaymentMethods(restaurant.getPaymentMethods());
        dto.setSpecialFeatures(restaurant.getSpecialFeatures());
        dto.setCategories(restaurant.getCategories());
        
        if (restaurant.getUser() != null) {
            dto.setUserId(restaurant.getUser().getId());
        }

        // Convert menu items to DTOs
        if (restaurant.getMenus() != null && !restaurant.getMenus().isEmpty()) {
            dto.setMenuItems(restaurant.getMenus().stream()
                .map(MenuDTO::fromEntity)
                .toList());
        }
        
        return dto;
    }
} 