package de.kesselops.guest.service;

import de.kesselops.guest.model.CartItem;
import de.kesselops.guest.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;

    /**
     * Get all cart items for a session.
     */
    @Transactional(readOnly = true)
    public List<CartItem> getSessionCart(Long sessionId) {
        return cartItemRepository.findBySessionId(sessionId);
    }

    /**
     * Add item to cart or update quantity if it already exists.
     */
    public CartItem addToCart(Long sessionId, Long menuItemId, String menuItemName,
            BigDecimal unitPrice, String menuItemImage) {
        Optional<CartItem> existing = cartItemRepository.findBySessionIdAndMenuItemId(sessionId, menuItemId);

        if (existing.isPresent()) {
            // Increment quantity
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + 1);
            return cartItemRepository.save(item);
        } else {
            // Create new cart item
            CartItem newItem = CartItem.builder()
                    .sessionId(sessionId)
                    .menuItemId(menuItemId)
                    .menuItemName(menuItemName)
                    .quantity(1)
                    .unitPrice(unitPrice)
                    .menuItemImage(menuItemImage)
                    .build();
            return cartItemRepository.save(newItem);
        }
    }

    /**
     * Update cart item quantity.
     */
    public CartItem updateQuantity(Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + cartItemId));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return item;
        }

        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    /**
     * Remove item from cart.
     */
    public void removeFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    /**
     * Clear all cart items for a session (e.g., after placing order).
     */
    public void clearCart(Long sessionId) {
        cartItemRepository.deleteBySessionId(sessionId);
    }
}
