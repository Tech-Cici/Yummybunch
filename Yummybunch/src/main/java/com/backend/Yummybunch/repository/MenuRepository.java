package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    Optional<Menu> findByRestaurant(Restaurant restaurant);
    List<Menu> findByRestaurantAndActive(Restaurant restaurant, boolean active);
    List<Menu> findByRestaurantId(Long restaurantId);
} 