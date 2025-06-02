package com.backend.Yummybunch.repository;

import com.backend.Yummybunch.model.Menu;
import com.backend.Yummybunch.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByMenu(Menu menu);
    List<MenuItem> findByMenuId(Long menuId);
    List<MenuItem> findByMenuAndAvailable(Menu menu, Boolean available);
} 