package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Favorite;
import com.backend.Yummybunch.model.Restaurant;
import com.backend.Yummybunch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    Optional<Favorite> findByUserAndRestaurant(User user, Restaurant restaurant);
    boolean existsByUserAndRestaurant(User user, Restaurant restaurant);
    void deleteByUserAndRestaurant(User user, Restaurant restaurant);
    List<Favorite> findByUser(User user);
} 