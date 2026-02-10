package de.kesselops.guest.controller;

import de.kesselops.guest.dto.CreateOrderRequest;
import de.kesselops.guest.dto.UpdateOrderStatusRequest;
import de.kesselops.guest.model.Order;
import de.kesselops.guest.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/sessions/{sessionId}/orders - Create order for session
     */
    @PostMapping("/api/sessions/{sessionId}/orders")
    public ResponseEntity<Order> createOrder(
            @PathVariable Long sessionId,
            @Valid @RequestBody CreateOrderRequest request) {
        Order order = orderService.createOrder(sessionId, request.getItems());
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * GET /api/sessions/{sessionId}/orders - Get all orders for session
     */
    @GetMapping("/api/sessions/{sessionId}/orders")
    public ResponseEntity<java.util.List<Order>> getSessionOrders(@PathVariable Long sessionId) {
        java.util.List<Order> orders = orderService.getSessionOrders(sessionId);
        return ResponseEntity.ok(orders);
    }

    /**
     * PATCH /api/orders/{orderId}/status - Update order status
     */
    @PatchMapping("/api/orders/{orderId}/status")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        Order order = orderService.updateStatus(orderId, request.getStatus());
        return ResponseEntity.ok(order);
    }
}
