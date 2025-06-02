package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.MenuItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemDTO {
    private Long id;
    private Long menuId;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private Boolean available;

    public static MenuItemDTO fromEntity(MenuItem item) {
        if (item == null) return null;
        
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(item.getId());
        dto.setMenuId(item.getMenu() != null ? item.getMenu().getId() : null);
        dto.setName(item.getName());
        dto.setDescription(item.getDescription());
        dto.setPrice(item.getPrice());
        dto.setImageUrl(item.getImageUrl());
        dto.setAvailable(item.getAvailable());
        return dto;
    }
} 