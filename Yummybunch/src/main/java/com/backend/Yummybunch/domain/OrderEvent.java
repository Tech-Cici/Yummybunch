package com.backend.Yummybunch.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * One entry per status change, so the customer can see a real timeline
 * ("Received 12:04, Preparing 12:06") rather than just the latest state.
 */
@Getter
@Setter
@Entity
@Table(name = "order_events", indexes = @Index(columnList = "order_id"))
public class OrderEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, updatable = false)
    private Instant at = Instant.now();
}
