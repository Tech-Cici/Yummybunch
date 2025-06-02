package com.backend.Yummybunch.service;

import com.backend.Yummybunch.repository.UserRepository;
import com.backend.Yummybunch.repository.RestaurantRepository;
import com.backend.Yummybunch.repository.OrderRepository;
import com.backend.Yummybunch.model.User.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminService {
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private OrderRepository orderRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        try {
            // Get total users (excluding admins)
            long totalUsers = userRepository.countByRoleNot(UserRole.ADMIN);
            stats.put("totalUsers", totalUsers);
            
            // Get total restaurants
            long totalRestaurants = restaurantRepository.count();
            stats.put("totalRestaurants", totalRestaurants);
            
            // Get total orders
            long totalOrders = orderRepository.count();
            stats.put("totalOrders", totalOrders);
            
            // Get total revenue
            double totalRevenue = orderRepository.sumTotalAmount();
            stats.put("totalRevenue", totalRevenue);
            
            logger.info("Dashboard stats retrieved successfully: {}", stats);
        } catch (Exception e) {
            logger.error("Error retrieving dashboard stats: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve dashboard stats: " + e.getMessage());
        }
        return stats;
    }
} 