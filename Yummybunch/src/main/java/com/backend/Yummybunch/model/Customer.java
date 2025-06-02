package com.backend.Yummybunch.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "customers")
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = true)
    private String address;

    @Column(name = "delivery_preferences", nullable = true)
    private String deliveryPreferences;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(nullable = true)
    private String preferences;

    @Column(name = "delivery_instructions", nullable = true)
    private String deliveryInstructions;

    @Column(name = "loyalty_points")
    private int loyaltyPoints = 0;

    @OneToMany(mappedBy = "customer")
    private List<Order> orders;

    @ManyToMany
    @JoinTable(
        name = "customer_favorite_restaurants",
        joinColumns = @JoinColumn(name = "customer_id"),
        inverseJoinColumns = @JoinColumn(name = "restaurant_id")
    )
    private List<Restaurant> favoriteRestaurants;
} 