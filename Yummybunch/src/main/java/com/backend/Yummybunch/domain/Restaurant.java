package com.backend.Yummybunch.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The owning account. One restaurant per owner. */
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String cuisine;

    private String address;

    private String phone;

    /** Relative path served by the backend, e.g. /uploads/cover-abc.jpg */
    private String coverImageUrl;

    private String openingTime = "09:00";

    private String closingTime = "22:00";

    /** Owner-controlled: when closed, customers cannot place orders. */
    @Column(nullable = false)
    private boolean acceptingOrders = true;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
