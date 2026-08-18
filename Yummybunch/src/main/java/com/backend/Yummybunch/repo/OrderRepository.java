package com.backend.Yummybunch.repo;

import com.backend.Yummybunch.domain.Order;
import com.backend.Yummybunch.domain.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerIdOrderByPlacedAtDesc(Long customerId);
    List<Order> findByRestaurantIdOrderByPlacedAtDesc(Long restaurantId);
    List<Order> findByRestaurantIdAndStatusInOrderByPlacedAtAsc(Long restaurantId, List<OrderStatus> statuses);
    long countByRestaurantId(Long restaurantId);
}
