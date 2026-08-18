package com.backend.Yummybunch.web;

import com.backend.Yummybunch.domain.User;
import com.backend.Yummybunch.dto.Dtos.OrderView;
import com.backend.Yummybunch.dto.Dtos.PlaceOrderRequest;
import com.backend.Yummybunch.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Customer-side ordering. */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderView place(@AuthenticationPrincipal User user, @RequestBody PlaceOrderRequest req) {
        return OrderView.of(orderService.place(require(user), req));
    }

    /** The signed-in customer's own orders, newest first. */
    @GetMapping
    public List<OrderView> mine(@AuthenticationPrincipal User user) {
        return orderService.forCustomer(require(user)).stream().map(OrderView::of).toList();
    }

    /** Readable by the customer who placed it and by the restaurant that received it. */
    @GetMapping("/{id}")
    public OrderView one(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return OrderView.of(orderService.readable(require(user), id));
    }

    @PostMapping("/{id}/cancel")
    public OrderView cancel(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return OrderView.of(orderService.cancel(require(user), id));
    }

    private User require(User user) {
        if (user == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Sign in to continue");
        return user;
    }
}
