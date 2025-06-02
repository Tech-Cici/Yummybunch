package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.Order;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private CustomerDTO customer;
    private RestaurantDTO restaurant;
    private LocalDateTime orderTime;
    private String deliveryAddress;
    private String specialInstructions;
    private Double total;
    private Order.OrderStatus status;
    private List<OrderItemDTO> items;

    public static OrderDTO fromEntity(Order order) {
        if (order == null) return null;
        
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomer(CustomerDTO.fromEntity(order.getCustomer()));
        dto.setRestaurant(RestaurantDTO.fromEntity(order.getRestaurant()));
        dto.setOrderTime(order.getOrderTime());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setSpecialInstructions(order.getSpecialInstructions());
        dto.setTotal(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setItems(order.getItems().stream()
                .map(OrderItemDTO::fromEntity)
                .collect(Collectors.toList()));
        return dto;
    }
} 