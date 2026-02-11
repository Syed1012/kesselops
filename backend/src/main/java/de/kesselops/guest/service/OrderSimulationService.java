package de.kesselops.guest.service;

import de.kesselops.guest.model.Order;
import de.kesselops.guest.model.OrderStatus;
import de.kesselops.guest.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderSimulationService {

    private final OrderRepository orderRepository;

    /**
     * Simulate order lifecycle: PENDING -> KITCHEN -> READY -> SERVED
     * Runs every 10 seconds.
     */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void simulateOrderProgress() {
        List<Order> activeOrders = orderRepository.findByStatusNot(OrderStatus.SERVED);

        int updatedCount = 0;
        for (Order order : activeOrders) {
            boolean changed = false;
            switch (order.getStatus()) {
                case PENDING:
                    order.setStatus(OrderStatus.KITCHEN);
                    changed = true;
                    break;
                case KITCHEN:
                    order.setStatus(OrderStatus.READY);
                    changed = true;
                    break;
                case READY:
                    order.setStatus(OrderStatus.SERVED);
                    changed = true;
                    break;
                default:
                    // SERVED or unknown
                    break;
            }

            if (changed) {
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            orderRepository.saveAll(activeOrders);
            log.info("Simulation: Updated {} orders to next status", updatedCount);
        }
    }
}
