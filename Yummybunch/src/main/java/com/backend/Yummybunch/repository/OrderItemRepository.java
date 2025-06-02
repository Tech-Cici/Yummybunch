package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Order;
import com.backend.Yummybunch.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrder(Order order);
} 