package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Customer;
import com.backend.Yummybunch.model.Order;
import com.backend.Yummybunch.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRestaurant(Restaurant restaurant);
    List<Order> findByRestaurantAndStatus(Restaurant restaurant, Order.OrderStatus status);
    List<Order> findByRestaurantId(Long restaurantId);
    List<Order> findByCustomer(Customer customer);
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByCustomerAndStatus(Customer customer, Order.OrderStatus status);
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    double sumTotalAmount();
} 