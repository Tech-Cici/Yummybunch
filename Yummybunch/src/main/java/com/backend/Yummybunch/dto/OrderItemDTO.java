package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {
    private Long id;
    private String itemName;
    private Integer quantity;
    private Double price;
    private String specialInstructions;

    public static OrderItemDTO fromEntity(OrderItem orderItem) {
        if (orderItem == null) return null;
        
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(orderItem.getId());
        dto.setItemName(orderItem.getItemName());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setSpecialInstructions(orderItem.getSpecialInstructions());
        return dto;
    }
} 