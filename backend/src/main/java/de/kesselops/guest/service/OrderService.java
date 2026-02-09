package de.kesselops.guest.service;

import de.kesselops.guest.dto.OrderItemRequest;
import de.kesselops.guest.model.Order;
import de.kesselops.guest.model.OrderItem;
import de.kesselops.guest.model.OrderStatus;
import de.kesselops.guest.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;

    /**
     * Create an order for a session.
     * 
     * @param sessionId    the session ID
     * @param itemRequests list of order items with pricing
     */
    public Order createOrder(Long sessionId, List<OrderItemRequest> itemRequests) {
        Order order = Order.builder()
                .sessionId(sessionId)
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal orderTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : itemRequests) {
            BigDecimal lineTotal = itemRequest.getUnitPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .menuItemId(itemRequest.getMenuItemId())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(itemRequest.getUnitPrice())
                    .lineTotal(lineTotal)
                    .build();
            order.getItems().add(item);
            orderTotal = orderTotal.add(lineTotal);
        }

        order.setTotalAmount(orderTotal);
        return orderRepository.save(order);
    }

    /**
     * Update order status: PENDING → KITCHEN → READY → SERVED
     */
    public Order updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(newStatus);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersBySession(Long sessionId) {
        return orderRepository.findBySessionId(sessionId);
    }
}
