package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.dto.OrderDTO;
import com.backend.Yummybunch.dto.OrderItemDTO;
import com.backend.Yummybunch.model.*;
import com.backend.Yummybunch.repository.*;
import com.backend.Yummybunch.service.OrderService;
import com.backend.Yummybunch.service.RestaurantService;
import com.backend.Yummybunch.service.CustomerService;
import com.backend.Yummybunch.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantService restaurantService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private UserService userService;

    @GetMapping("/restaurant")
    public ResponseEntity<?> getRestaurantOrders(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getRole() == User.UserRole.RESTAURANT) {
                Restaurant restaurant = restaurantService.getRestaurantByUserId(user.getId());
                if (restaurant == null) {
                    return ResponseEntity.badRequest().body("Restaurant not found");
                }
                List<Order> orders = orderService.findByRestaurantId(restaurant.getId());
                return ResponseEntity.ok(orders.stream()
                        .map(OrderDTO::fromEntity)
                        .limit(limit)
                        .toList());
            } else {
                Customer customer = customerService.findByUserId(user.getId())
                        .orElseThrow(() -> new RuntimeException("Customer not found"));
                List<OrderDTO> orders = orderService.getCustomerOrders(customer);
                return ResponseEntity.ok(orders.stream()
                        .limit(limit)
                        .toList());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching orders: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderDTO>> getUserOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Order> orders = orderRepository.findByCustomer(customer);
        List<OrderDTO> orderDTOs = orders.stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(orderDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return ResponseEntity.ok(OrderDTO.fromEntity(order));
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO orderDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = customerRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Restaurant restaurant = restaurantRepository.findById(orderDTO.getRestaurant().getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setOrderTime(LocalDateTime.now());
        order.setDeliveryAddress(orderDTO.getDeliveryAddress());
        order.setSpecialInstructions(orderDTO.getSpecialInstructions());
        order.setTotalAmount(orderDTO.getTotal());

        Order savedOrder = orderRepository.save(order);

        for (OrderItemDTO itemDTO : orderDTO.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setItemName(itemDTO.getItemName());
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(itemDTO.getPrice());
            orderItem.setSpecialInstructions(itemDTO.getSpecialInstructions());

            orderItemRepository.save(orderItem);
        }

        return ResponseEntity.ok(OrderDTO.fromEntity(savedOrder));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, orderStatus);
            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating order status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.CANCELLED);
            orderRepository.save(order);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().body("Cannot cancel order in current status");
        }
    }
} 