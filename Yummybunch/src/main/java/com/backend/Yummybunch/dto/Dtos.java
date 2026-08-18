package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.domain.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Every payload crossing the API boundary. Entities are never serialised
 * directly, so a password hash or lazy proxy can never leak into a response.
 */
public final class Dtos {

    private Dtos() {}

    // ---------- auth ----------

    public record RegisterRequest(
            String email, String password, String name, String phone, String role,
            // restaurant signups only
            String restaurantName, String cuisine, String address) {}

    public record VerifyRequest(String email, String code) {}

    public record ResendRequest(String email) {}

    public record LoginRequest(String email, String password) {}

    public record AuthResponse(String token, UserView user) {}

    public record UserView(Long id, String email, String name, String phone,
                           String role, boolean emailVerified) {
        public static UserView of(User u) {
            return new UserView(u.getId(), u.getEmail(), u.getName(), u.getPhone(),
                    u.getRole().name(), u.isEmailVerified());
        }
    }

    // ---------- restaurants ----------

    public record RestaurantView(
            Long id, String name, String description, String cuisine, String address,
            String phone, String coverImageUrl, String openingTime, String closingTime,
            boolean acceptingOrders, long menuItemCount) {

        public static RestaurantView of(Restaurant r, long menuItemCount) {
            return new RestaurantView(r.getId(), r.getName(), r.getDescription(), r.getCuisine(),
                    r.getAddress(), r.getPhone(), r.getCoverImageUrl(), r.getOpeningTime(),
                    r.getClosingTime(), r.isAcceptingOrders(), menuItemCount);
        }

        public static RestaurantView of(Restaurant r) {
            return of(r, 0L);
        }
    }

    public record RestaurantProfileRequest(
            String name, String description, String cuisine, String address,
            String phone, String openingTime, String closingTime, Boolean acceptingOrders) {}

    // ---------- menu ----------

    public record MenuItemView(Long id, String name, String description, BigDecimal price,
                               String category, String imageUrl, boolean available) {
        public static MenuItemView of(MenuItem m) {
            return new MenuItemView(m.getId(), m.getName(), m.getDescription(), m.getPrice(),
                    m.getCategory(), m.getImageUrl(), m.isAvailable());
        }
    }

    public record MenuItemRequest(String name, String description, BigDecimal price,
                                  String category, Boolean available) {}

    // ---------- orders ----------

    public record PlaceOrderRequest(Long restaurantId, String deliveryAddress, String notes,
                                    List<LineRequest> items) {
        public record LineRequest(Long menuItemId, Integer quantity) {}
    }

    public record AdvanceStatusRequest(String status, String note) {}

    public record OrderLineView(String itemName, BigDecimal unitPrice, int quantity, BigDecimal lineTotal) {
        public static OrderLineView of(OrderItem i) {
            return new OrderLineView(i.getItemName(), i.getUnitPrice(), i.getQuantity(), i.lineTotal());
        }
    }

    public record TimelineEntryView(String status, String note, Instant at) {
        public static TimelineEntryView of(OrderEvent e) {
            return new TimelineEntryView(e.getStatus().name(), e.getNote(), e.getAt());
        }
    }

    public record OrderView(
            Long id, String status, BigDecimal total, String deliveryAddress, String notes,
            String rejectionReason, Instant placedAt, Instant updatedAt,
            Long restaurantId, String restaurantName, String restaurantPhone,
            String customerName, String customerPhone, String customerEmail,
            List<OrderLineView> items, List<TimelineEntryView> timeline,
            List<String> nextStatuses) {

        public static OrderView of(Order o) {
            List<String> next = java.util.Arrays.stream(OrderStatus.values())
                    .filter(s -> o.getStatus().canRestaurantMoveTo(s))
                    .map(Enum::name)
                    .toList();

            return new OrderView(
                    o.getId(), o.getStatus().name(), o.getTotal(), o.getDeliveryAddress(), o.getNotes(),
                    o.getRejectionReason(), o.getPlacedAt(), o.getUpdatedAt(),
                    o.getRestaurant().getId(), o.getRestaurant().getName(), o.getRestaurant().getPhone(),
                    o.getCustomer().getName(), o.getCustomer().getPhone(), o.getCustomer().getEmail(),
                    o.getItems().stream().map(OrderLineView::of).toList(),
                    o.getEvents().stream().map(TimelineEntryView::of).toList(),
                    next);
        }
    }
}
