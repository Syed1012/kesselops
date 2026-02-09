package de.kesselops.guest.service;

import de.kesselops.guest.model.Order;
import de.kesselops.guest.model.Payment;
import de.kesselops.guest.model.PaymentMethod;
import de.kesselops.guest.repository.OrderRepository;
import de.kesselops.guest.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final SessionService sessionService;

    /**
     * Record a payment against a session.
     * Supports both app payments and waiter-collected (manual) payments.
     * Auto-closes the session when total payments >= total order amounts.
     * 
     * @param sessionId          the session ID
     * @param amount             payment amount
     * @param paymentMethod      CASH, CARD, or MOBILE_PAY
     * @param collectedByStaffId staff who collected payment (for waiter payments)
     */
    public Payment recordPayment(Long sessionId, BigDecimal amount,
            PaymentMethod paymentMethod, Long collectedByStaffId) {
        Payment payment = Payment.builder()
                .sessionId(sessionId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .collectedByStaffId(collectedByStaffId)
                .build();
        payment = paymentRepository.save(payment);

        // Auto-close session if fully paid
        autoCloseSessionIfFullyPaid(sessionId);

        return payment;
    }

    /**
     * Check if session is fully paid and auto-close if true.
     */
    private void autoCloseSessionIfFullyPaid(Long sessionId) {
        // Calculate total order amount
        List<Order> orders = orderRepository.findBySessionId(sessionId);
        BigDecimal totalOrderAmount = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate total payments
        List<Payment> payments = paymentRepository.findBySessionId(sessionId);
        BigDecimal totalPayments = payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Close session if total payments >= total order amount
        if (totalPayments.compareTo(totalOrderAmount) >= 0) {
            sessionService.closeSession(sessionId);
        }
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsBySession(Long sessionId) {
        return paymentRepository.findBySessionId(sessionId);
    }
}
