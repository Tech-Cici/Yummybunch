package com.backend.Yummybunch.service;

import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    public Restaurant save(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Optional<Restaurant> findByUserId(Long userId) {
        return restaurantRepository.findByUserId(userId);
    }

    public Restaurant getRestaurantByUserId(Long userId) {
        return restaurantRepository.findByUserId(userId)
                .orElse(null);
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id)
                .orElse(null);
    }

    public Optional<Restaurant> findById(Long id) {
        return restaurantRepository.findById(id);
    }
} 