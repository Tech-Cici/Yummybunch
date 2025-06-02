package com.backend.Yummybunch.dto;

import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.MenuItem;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuDTO {
    private Long id;
    private Long restaurantId;
    private String name;
    private String description;
    private String pdfUrl;
    private boolean active;
    
    @JsonManagedReference
    private List<MenuItemDTO> items;

    public static MenuDTO fromEntity(Menu menu) {
        if (menu == null) return null;
        
        MenuDTO dto = new MenuDTO();
        dto.setId(menu.getId());
        dto.setRestaurantId(menu.getRestaurant() != null ? menu.getRestaurant().getId() : null);
        dto.setName(menu.getName());
        dto.setDescription(menu.getDescription());
        dto.setPdfUrl(menu.getPdfUrl());
        dto.setActive(menu.isActive());
        if (menu.getItems() != null) {
            dto.setItems(menu.getItems().stream()
                    .map(MenuItemDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }
} 