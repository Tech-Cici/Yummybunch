package com.backend.Yummybunch.service;

import com.backend.Yummybunch.dto.OrderDTO;
import com.backend.Yummybunch.dto.OrderItemDTO;
import com.backend.Yummybunch.model.*;
import com.backend.Yummybunch.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO, Customer customer) {
        Restaurant restaurant = restaurantRepository.findById(orderDTO.getRestaurant().getId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setRestaurant(restaurant);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setDeliveryAddress(orderDTO.getDeliveryAddress());
        order.setSpecialInstructions(orderDTO.getSpecialInstructions());
        order.setTotalAmount(orderDTO.getTotal());

        Order savedOrder = orderRepository.save(order);

        List<OrderItem> orderItems = orderDTO.getItems().stream()
                .map(itemDTO -> {
                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(savedOrder);
                    orderItem.setItemName(itemDTO.getItemName());
                    orderItem.setQuantity(itemDTO.getQuantity());
                    orderItem.setPrice(itemDTO.getPrice());
                    orderItem.setSpecialInstructions(itemDTO.getSpecialInstructions());
                    return orderItem;
                })
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);
        savedOrder.setItems(orderItems);

        return OrderDTO.fromEntity(savedOrder);
    }

    public List<OrderDTO> getCustomerOrders(Customer customer) {
        List<Order> orders = orderRepository.findByCustomer(customer);
        return orders.stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getRestaurantOrders(Restaurant restaurant) {
        List<Order> orders = orderRepository.findByRestaurant(restaurant);
        return orders.stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<Order> findByRestaurantId(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId);
    }

    public List<Map<String, Object>> getTopSellingItems(Long restaurantId, int limit) {
        List<Order> orders = findByRestaurantId(restaurantId);
        
        Map<String, Long> itemCounts = orders.stream()
            .flatMap(order -> order.getItems().stream())
            .collect(Collectors.groupingBy(OrderItem::getItemName, Collectors.counting()));
        
        return itemCounts.entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(limit)
            .map(entry -> {
                Map<String, Object> itemData = new HashMap<>();
                itemData.put("name", entry.getKey());
                itemData.put("quantity", entry.getValue());
                return itemData;
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return OrderDTO.fromEntity(orderRepository.save(order));
    }
} 