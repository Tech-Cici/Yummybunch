package com.backend.Yummybunch.web;

import com.backend.Yummybunch.domain.MenuItem;
import com.backend.Yummybunch.domain.Restaurant;
import com.backend.Yummybunch.domain.User;
import com.backend.Yummybunch.dto.Dtos.*;
import com.backend.Yummybunch.repo.MenuItemRepository;
import com.backend.Yummybunch.repo.RestaurantRepository;
import com.backend.Yummybunch.service.OrderService;
import com.backend.Yummybunch.service.StorageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Everything a restaurant owner manages. Scoped to the caller's own restaurant —
 * no id is taken from the URL, so one owner can never touch another's data.
 */
@RestController
@RequestMapping("/api/my-restaurant")
public class MyRestaurantController {

    private final RestaurantRepository restaurants;
    private final MenuItemRepository menuItems;
    private final OrderService orderService;
    private final StorageService storage;

    public MyRestaurantController(RestaurantRepository restaurants, MenuItemRepository menuItems,
                                  OrderService orderService, StorageService storage) {
        this.restaurants = restaurants;
        this.menuItems = menuItems;
        this.orderService = orderService;
        this.storage = storage;
    }

    // ---------- profile ----------

    @GetMapping
    public RestaurantView profile(@AuthenticationPrincipal User user) {
        Restaurant r = mine(user);
        return RestaurantView.of(r, menuItems.countByRestaurantId(r.getId()));
    }

    @PutMapping
    public RestaurantView updateProfile(@AuthenticationPrincipal User user,
                                        @RequestBody RestaurantProfileRequest req) {
        Restaurant r = mine(user);
        if (req.name() != null && !req.name().isBlank()) r.setName(req.name().trim());
        if (req.description() != null) r.setDescription(req.description());
        if (req.cuisine() != null) r.setCuisine(req.cuisine());
        if (req.address() != null) r.setAddress(req.address());
        if (req.phone() != null) r.setPhone(req.phone());
        if (req.openingTime() != null) r.setOpeningTime(req.openingTime());
        if (req.closingTime() != null) r.setClosingTime(req.closingTime());
        if (req.acceptingOrders() != null) r.setAcceptingOrders(req.acceptingOrders());
        restaurants.save(r);
        return RestaurantView.of(r, menuItems.countByRestaurantId(r.getId()));
    }

    @PostMapping("/cover")
    public RestaurantView uploadCover(@AuthenticationPrincipal User user,
                                      @RequestParam("file") MultipartFile file) {
        Restaurant r = mine(user);
        String old = r.getCoverImageUrl();
        r.setCoverImageUrl(storage.storeImage(file));
        restaurants.save(r);
        storage.deleteByPublicPath(old); // only after the new one is safely stored
        return RestaurantView.of(r, menuItems.countByRestaurantId(r.getId()));
    }

    // ---------- menu ----------

    /** Owner view: includes unavailable items, which the public menu hides. */
    @GetMapping("/menu")
    public List<MenuItemView> menu(@AuthenticationPrincipal User user) {
        return menuItems.findByRestaurantIdOrderByCategoryAscNameAsc(mine(user).getId())
                .stream().map(MenuItemView::of).toList();
    }

    @PostMapping("/menu")
    public MenuItemView addItem(@AuthenticationPrincipal User user,
                                @RequestBody MenuItemRequest req) {
        Restaurant r = mine(user);
        MenuItem item = new MenuItem();
        item.setRestaurant(r);
        applyTo(item, req, true);
        return MenuItemView.of(menuItems.save(item));
    }

    @PutMapping("/menu/{itemId}")
    public MenuItemView updateItem(@AuthenticationPrincipal User user,
                                   @PathVariable Long itemId,
                                   @RequestBody MenuItemRequest req) {
        MenuItem item = ownedItem(user, itemId);
        applyTo(item, req, false);
        return MenuItemView.of(menuItems.save(item));
    }

    @PostMapping("/menu/{itemId}/image")
    public MenuItemView uploadItemImage(@AuthenticationPrincipal User user,
                                        @PathVariable Long itemId,
                                        @RequestParam("file") MultipartFile file) {
        MenuItem item = ownedItem(user, itemId);
        String old = item.getImageUrl();
        item.setImageUrl(storage.storeImage(file));
        menuItems.save(item);
        storage.deleteByPublicPath(old);
        return MenuItemView.of(item);
    }

    @DeleteMapping("/menu/{itemId}")
    public Map<String, String> deleteItem(@AuthenticationPrincipal User user, @PathVariable Long itemId) {
        MenuItem item = ownedItem(user, itemId);
        String image = item.getImageUrl();
        menuItems.delete(item);
        storage.deleteByPublicPath(image);
        return Map.of("message", "Menu item removed");
    }

    // ---------- incoming orders ----------

    @GetMapping("/orders")
    public List<OrderView> orders(@AuthenticationPrincipal User user) {
        return orderService.forOwner(require(user)).stream().map(OrderView::of).toList();
    }

    /** Advance an order: RECEIVED, PREPARING, READY, COMPLETED or REJECTED. */
    @PostMapping("/orders/{orderId}/status")
    public OrderView advance(@AuthenticationPrincipal User user,
                             @PathVariable Long orderId,
                             @RequestBody AdvanceStatusRequest req) {
        return OrderView.of(orderService.advance(require(user), orderId, req.status(), req.note()));
    }

    // ---------- helpers ----------

    private void applyTo(MenuItem item, MenuItemRequest req, boolean creating) {
        if (creating || req.name() != null) {
            if (req.name() == null || req.name().isBlank()) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Item name is required");
            }
            item.setName(req.name().trim());
        }
        if (creating || req.price() != null) {
            if (req.price() == null || req.price().compareTo(BigDecimal.ZERO) <= 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Price must be greater than zero");
            }
            item.setPrice(req.price());
        }
        if (req.description() != null) item.setDescription(req.description());
        if (req.category() != null) item.setCategory(req.category());
        if (req.available() != null) item.setAvailable(req.available());
    }

    private MenuItem ownedItem(User user, Long itemId) {
        Restaurant r = mine(user);
        MenuItem item = menuItems.findById(itemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Menu item not found"));
        if (!item.getRestaurant().getId().equals(r.getId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Menu item not found");
        }
        return item;
    }

    private Restaurant mine(User user) {
        return orderService.ownedRestaurant(require(user));
    }

    private User require(User user) {
        if (user == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Sign in to continue");
        return user;
    }
}
