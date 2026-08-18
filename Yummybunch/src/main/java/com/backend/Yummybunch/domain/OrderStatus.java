package com.backend.Yummybunch.domain;

import java.util.List;
import java.util.Set;

/**
 * The order lifecycle, enforced server-side.
 *
 * PLACED    customer submitted it; the restaurant has not looked yet
 * RECEIVED  restaurant acknowledged the order
 * PREPARING kitchen is cooking
 * READY     ready for pickup / handed to delivery
 * COMPLETED handed over to the customer
 *
 * CANCELLED customer pulled out (only allowed while PLACED)
 * REJECTED  restaurant declined (only allowed while PLACED or RECEIVED)
 */
public enum OrderStatus {
    PLACED,
    RECEIVED,
    PREPARING,
    READY,
    COMPLETED,
    CANCELLED,
    REJECTED;

    /** Transitions the restaurant owner may perform, keyed by current status. */
    private static final java.util.Map<OrderStatus, Set<OrderStatus>> RESTAURANT_MOVES = java.util.Map.of(
            PLACED,    Set.of(RECEIVED, REJECTED),
            RECEIVED,  Set.of(PREPARING, REJECTED),
            PREPARING, Set.of(READY),
            READY,     Set.of(COMPLETED),
            COMPLETED, Set.of(),
            CANCELLED, Set.of(),
            REJECTED,  Set.of()
    );

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == REJECTED;
    }

    /** True when a restaurant owner is allowed to move from this status to {@code next}. */
    public boolean canRestaurantMoveTo(OrderStatus next) {
        return RESTAURANT_MOVES.getOrDefault(this, Set.of()).contains(next);
    }

    /** A customer may only bail out before the kitchen has acknowledged the order. */
    public boolean canCustomerCancel() {
        return this == PLACED;
    }

    /** The happy path, in order — used to render a progress timeline. */
    public static List<OrderStatus> progression() {
        return List.of(PLACED, RECEIVED, PREPARING, READY, COMPLETED);
    }
}
