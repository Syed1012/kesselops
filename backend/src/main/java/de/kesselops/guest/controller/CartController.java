package de.kesselops.guest.controller;

import de.kesselops.guest.dto.AddToCartRequest;
import de.kesselops.guest.model.CartItem;
import de.kesselops.guest.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * GET /api/sessions/{sessionId}/cart - Get all cart items for session
     */
    @GetMapping("/api/sessions/{sessionId}/cart")
    public ResponseEntity<List<CartItem>> getSessionCart(@PathVariable Long sessionId) {
        List<CartItem> cart = cartService.getSessionCart(sessionId);
        return ResponseEntity.ok(cart);
    }

    /**
     * POST /api/sessions/{sessionId}/cart - Add item to cart
     */
    @PostMapping("/api/sessions/{sessionId}/cart")
    public ResponseEntity<CartItem> addToCart(
            @PathVariable Long sessionId,
            @Valid @RequestBody AddToCartRequest request) {
        CartItem cartItem = cartService.addToCart(
                sessionId,
                request.getMenuItemId(),
                request.getMenuItemName(),
                request.getUnitPrice(),
                request.getMenuItemImage());
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItem);
    }

    /**
     * PATCH /api/cart/{cartItemId} - Update cart item quantity
     */
    @PatchMapping("/api/cart/{cartItemId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        CartItem cartItem = cartService.updateQuantity(cartItemId, quantity);
        return ResponseEntity.ok(cartItem);
    }

    /**
     * DELETE /api/cart/{cartItemId} - Remove item from cart
     */
    @DeleteMapping("/api/cart/{cartItemId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/sessions/{sessionId}/cart - Clear entire cart
     */
    @DeleteMapping("/api/sessions/{sessionId}/cart")
    public ResponseEntity<Void> clearCart(@PathVariable Long sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.noContent().build();
    }
}
