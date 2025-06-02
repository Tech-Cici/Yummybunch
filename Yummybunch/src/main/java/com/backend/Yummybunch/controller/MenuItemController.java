package com.backend.Yummybunch.controller;

import com.backend.Yummybunch.dto.MenuItemDTO;
import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.MenuItem;
import com.backend.Yummybunch.repository.MenuItemRepository;
import com.backend.Yummybunch.repository.MenuRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private MenuRepository menuRepository;

    @GetMapping
    public ResponseEntity<List<MenuItemDTO>> getAllMenuItems() {
        List<MenuItem> items = menuItemRepository.findAll();
        List<MenuItemDTO> dtos = items.stream()
                .map(MenuItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItemDTO> getMenuItem(@PathVariable Long id) {
        return menuItemRepository.findById(id)
                .map(item -> ResponseEntity.ok(MenuItemDTO.fromEntity(item)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MenuItemDTO> createMenuItem(@RequestBody MenuItemDTO menuItemDTO) {
        Menu menu = menuRepository.findById(menuItemDTO.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu not found"));

        MenuItem toSave = new MenuItem();
        toSave.setMenu(menu);
        toSave.setName(menuItemDTO.getName());
        toSave.setDescription(menuItemDTO.getDescription());
        toSave.setPrice(menuItemDTO.getPrice());
        toSave.setImageUrl(menuItemDTO.getImageUrl());
        toSave.setAvailable(menuItemDTO.getAvailable());

        MenuItem saved = menuItemRepository.save(toSave);
        return ResponseEntity.ok(MenuItemDTO.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(@PathVariable Long id, @RequestBody MenuItemDTO menuItemDTO) {
        return menuItemRepository.findById(id)
                .map(existingItem -> {
                    existingItem.setName(menuItemDTO.getName());
                    existingItem.setDescription(menuItemDTO.getDescription());
                    existingItem.setPrice(menuItemDTO.getPrice());
                    existingItem.setImageUrl(menuItemDTO.getImageUrl());
                    existingItem.setAvailable(menuItemDTO.getAvailable());

                    if (menuItemDTO.getMenuId() != null) {
                        Menu menu = menuRepository.findById(menuItemDTO.getMenuId())
                                .orElseThrow(() -> new RuntimeException("Menu not found"));
                        existingItem.setMenu(menu);
                    }

                    MenuItem updated = menuItemRepository.save(existingItem);
                    return ResponseEntity.ok(MenuItemDTO.fromEntity(updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        return menuItemRepository.findById(id)
                .map(item -> {
                    menuItemRepository.delete(item);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/menu/{menuId}")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByMenu(@PathVariable Long menuId) {
        List<MenuItem> items = menuItemRepository.findByMenuId(menuId);
        List<MenuItemDTO> dtos = items.stream()
                .map(MenuItemDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
} 