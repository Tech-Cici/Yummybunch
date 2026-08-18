package com.backend.Yummybunch.web;

import com.backend.Yummybunch.domain.MenuItem;
import com.backend.Yummybunch.domain.Restaurant;
import com.backend.Yummybunch.dto.Dtos.MenuItemView;
import com.backend.Yummybunch.dto.Dtos.RestaurantView;
import com.backend.Yummybunch.repo.MenuItemRepository;
import com.backend.Yummybunch.repo.RestaurantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public catalogue. None of this requires a token — a visitor must be able to
 * browse restaurants and read menus before deciding to create an account.
 */
@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantRepository restaurants;
    private final MenuItemRepository menuItems;

    public RestaurantController(RestaurantRepository restaurants, MenuItemRepository menuItems) {
        this.restaurants = restaurants;
        this.menuItems = menuItems;
    }

    /** All restaurants, optionally filtered by free-text query and/or cuisine. */
    @GetMapping
    public List<RestaurantView> list(@RequestParam(required = false) String q,
                                     @RequestParam(required = false) String cuisine) {
        return restaurants.search(q, cuisine).stream()
                .map(r -> RestaurantView.of(r, menuItems.countByRestaurantId(r.getId())))
                .toList();
    }

    /** Kept as a separate path because the old frontend linked to /search. */
    @GetMapping("/search")
    public List<RestaurantView> search(@RequestParam(required = false) String q,
                                       @RequestParam(required = false) String cuisine) {
        return list(q, cuisine);
    }

    /** Distinct cuisines, for the browse filter. */
    @GetMapping("/cuisines")
    public List<String> cuisines() {
        return restaurants.findDistinctCuisines();
    }

    @GetMapping("/{id}")
    public RestaurantView one(@PathVariable Long id) {
        Restaurant r = restaurants.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Restaurant not found"));
        return RestaurantView.of(r, menuItems.countByRestaurantId(id));
    }

    /** Only items the restaurant has marked available are exposed publicly. */
    @GetMapping("/{id}/menu")
    public ResponseEntity<List<MenuItemView>> menu(@PathVariable Long id) {
        if (!restaurants.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Restaurant not found");
        }
        List<MenuItem> items = menuItems.findByRestaurantIdAndAvailableTrueOrderByCategoryAscNameAsc(id);
        return ResponseEntity.ok(items.stream().map(MenuItemView::of).toList());
    }
}
