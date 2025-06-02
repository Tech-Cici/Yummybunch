package com.backend.Yummybunch.requests;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MenuItemRequest {
   private boolean available;
    private String category;
    private String description;
    private String name;
    private BigDecimal price;
}
