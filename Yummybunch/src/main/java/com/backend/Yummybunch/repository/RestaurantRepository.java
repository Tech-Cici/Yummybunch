package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByCuisineType(String cuisineType);
    List<Restaurant> findByNameContainingIgnoreCase(String name);
    Optional<Restaurant> findByEmail(String email);
    Optional<Restaurant> findByUserId(Long userId);
} 