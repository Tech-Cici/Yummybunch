package com.backend.Yummybunch.repo;

import com.backend.Yummybunch.domain.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByRestaurantIdOrderByCategoryAscNameAsc(Long restaurantId);

    List<MenuItem> findByRestaurantIdAndAvailableTrueOrderByCategoryAscNameAsc(Long restaurantId);

    long countByRestaurantId(Long restaurantId);

    long countByRestaurantIdAndAvailableTrue(Long restaurantId);
}
