package com.backend.Yummybunch.service;

import com.backend.Yummybunch.domain.*;
import com.backend.Yummybunch.dto.Dtos;
import com.backend.Yummybunch.repo.MenuItemRepository;
import com.backend.Yummybunch.repo.OrderRepository;
import com.backend.Yummybunch.repo.RestaurantRepository;
import com.backend.Yummybunch.web.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orders;
    private final RestaurantRepository restaurants;
    private final MenuItemRepository menuItems;

    public OrderService(OrderRepository orders, RestaurantRepository restaurants,
                        MenuItemRepository menuItems) {
        this.orders = orders;
        this.restaurants = restaurants;
        this.menuItems = menuItems;
    }

    @Transactional
    public Order place(User customer, Dtos.PlaceOrderRequest req) {
        if (customer.getRole() != User.Role.CUSTOMER) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only customer accounts can place orders");
        }
        if (req.restaurantId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Choose a restaurant");
        }
        if (req.deliveryAddress() == null || req.deliveryAddress().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A delivery address is required");
        }
        if (req.items() == null || req.items().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your cart is empty");
        }

        Restaurant restaurant = restaurants.findById(req.restaurantId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        if (!restaurant.isAcceptingOrders()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    restaurant.getName() + " is not accepting orders right now");
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setDeliveryAddress(req.deliveryAddress().trim());
        order.setNotes(req.notes());

        for (Dtos.PlaceOrderRequest.LineRequest line : req.items()) {
            if (line.menuItemId() == null || line.quantity() == null || line.quantity() < 1) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Every line needs an item and a quantity of at least 1");
            }
            MenuItem item = menuItems.findById(line.menuItemId())
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                            "One of the items is no longer on the menu"));

            // Guard against a cart assembled from another restaurant's menu.
            if (!item.getRestaurant().getId().equals(restaurant.getId())) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "\"" + item.getName() + "\" does not belong to " + restaurant.getName());
            }
            if (!item.isAvailable()) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "\"" + item.getName() + "\" is currently unavailable");
            }

            OrderItem oi = new OrderItem();
            oi.setMenuItemId(item.getId());
            oi.setItemName(item.getName());   // snapshot
            oi.setUnitPrice(item.getPrice()); // snapshot
            oi.setQuantity(line.quantity());
            order.addItem(oi);
        }

        // Price is computed here, never taken from the client.
        order.setTotal(order.computeTotal());
        order.setStatus(OrderStatus.PLACED);
        order.recordEvent(OrderStatus.PLACED, "Order placed");
        order.setUpdatedAt(Instant.now());

        return hydrate(orders.save(order));
    }

    @Transactional(readOnly = true)
    public List<Order> forCustomer(User customer) {
        return hydrateAll(orders.findByCustomerIdOrderByPlacedAtDesc(customer.getId()));
    }

    @Transactional(readOnly = true)
    public List<Order> forOwner(User owner) {
        Restaurant restaurant = ownedRestaurant(owner);
        return hydrateAll(orders.findByRestaurantIdOrderByPlacedAtDesc(restaurant.getId()));
    }

    @Transactional(readOnly = true)
    public Order readable(User user, Long orderId) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        boolean isCustomer = order.getCustomer().getId().equals(user.getId());
        boolean isOwner = user.getRole() == User.Role.RESTAURANT
                && order.getRestaurant().getOwner().getId().equals(user.getId());

        if (!isCustomer && !isOwner) {
            // 404 rather than 403: do not confirm that someone else's order exists.
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        return hydrate(order);
    }

    /** Restaurant-driven transition, validated against {@link OrderStatus}. */
    @Transactional
    public Order advance(User owner, Long orderId, String rawStatus, String note) {
        Restaurant restaurant = ownedRestaurant(owner);
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getRestaurant().getId().equals(restaurant.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }

        OrderStatus next;
        try {
            next = OrderStatus.valueOf(rawStatus == null ? "" : rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown status \"" + rawStatus + "\"");
        }

        if (!order.getStatus().canRestaurantMoveTo(next)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Cannot move an order from " + order.getStatus() + " to " + next);
        }
        if (next == OrderStatus.REJECTED && (note == null || note.isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Give a reason when rejecting an order");
        }

        order.setStatus(next);
        if (next == OrderStatus.REJECTED) {
            order.setRejectionReason(note);
        }
        order.recordEvent(next, note);
        order.setUpdatedAt(Instant.now());
        return hydrate(orders.save(order));
    }

    /** Customers may only pull out before the restaurant has acknowledged the order. */
    @Transactional
    public Order cancel(User customer, Long orderId) {
        Order order = orders.findById(orderId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getCustomer().getId().equals(customer.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Order not found");
        }
        if (!order.getStatus().canCustomerCancel()) {
            throw new ApiException(HttpStatus.CONFLICT,
                    order.getStatus() == OrderStatus.PLACED
                            ? "This order can no longer be cancelled"
                            : "The restaurant has already started this order, so it cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.recordEvent(OrderStatus.CANCELLED, "Cancelled by customer");
        order.setUpdatedAt(Instant.now());
        return hydrate(orders.save(order));
    }

    public Restaurant ownedRestaurant(User owner) {
        return restaurants.findByOwnerId(owner.getId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No restaurant is linked to this account"));
    }

    /**
     * Touches everything OrderView reads while the session is still open.
     * With spring.jpa.open-in-view=false (the safe default), any lazy field left
     * untouched here would blow up during JSON serialisation instead.
     */
    private Order hydrate(Order order) {
        order.getRestaurant().getName();
        order.getCustomer().getName();
        order.getItems().size();
        order.getEvents().size();
        return order;
    }

    private List<Order> hydrateAll(List<Order> list) {
        list.forEach(this::hydrate);
        return list;
    }
}
