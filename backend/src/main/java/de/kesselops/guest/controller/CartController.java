package de.kesselops.guest.controller;

import de.kesselops.guest.dto.AddToCartRequest;
import de.kesselops.guest.model.CartItem;
import de.kesselops.guest.service.CartService;
import de.kesselops.shared.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<CartItem>>> getSessionCart(@PathVariable Long sessionId) {
        List<CartItem> cart = cartService.getSessionCart(sessionId);
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    // ... skipped ...

    /**
     * DELETE /api/sessions/{sessionId}/cart - Clear entire cart
     */
    @DeleteMapping("/api/sessions/{sessionId}/cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable Long sessionId) {
        cartService.clearCart(sessionId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/api/sessions/{sessionId}/cart")
    public ResponseEntity<ApiResponse<CartItem>> addToCart(
            @PathVariable Long sessionId,
            @Valid @RequestBody AddToCartRequest request) {
        CartItem cartItem = cartService.addToCart(
                sessionId,
                request.getMenuItemId(),
                request.getMenuItemName(),
                request.getUnitPrice(),
                request.getMenuItemImage());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(cartItem));
    }

    /**
     * PATCH /api/cart/{cartItemId} - Update cart item quantity
     */
    @PatchMapping("/api/cart/{cartItemId}")
    public ResponseEntity<ApiResponse<CartItem>> updateQuantity(
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        CartItem cartItem = cartService.updateQuantity(cartItemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(cartItem));
    }

    /**
     * DELETE /api/cart/{cartItemId} - Remove item from cart
     */
    @DeleteMapping("/api/cart/{cartItemId}")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(@PathVariable Long cartItemId) {
        cartService.removeFromCart(cartItemId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

}
