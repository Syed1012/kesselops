package de.kesselops.guest.repository;

import de.kesselops.guest.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findBySessionId(Long sessionId);

    Optional<CartItem> findBySessionIdAndMenuItemId(Long sessionId, Long menuItemId);

    void deleteBySessionId(Long sessionId);
}
