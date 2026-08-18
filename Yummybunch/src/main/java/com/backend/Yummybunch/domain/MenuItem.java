package com.backend.Yummybunch.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "menu_items", indexes = @Index(columnList = "restaurant_id"))
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "restaurant_id", nullable = false)
    private Restaurant restaurant;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    /** BigDecimal, not double — money must not accumulate float error. */
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Free-text grouping shown as a menu section, e.g. "Starters". */
    private String category;

    private String imageUrl;

    @Column(nullable = false)
    private boolean available = true;
}
