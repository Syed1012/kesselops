package de.kesselops.guest.controller;

import de.kesselops.guest.dto.CreatePaymentRequest;
import de.kesselops.guest.model.Payment;
import de.kesselops.guest.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * POST /api/sessions/{sessionId}/payments - Record payment (app or manual)
     */
    @PostMapping("/api/sessions/{sessionId}/payments")
    public ResponseEntity<Payment> recordPayment(
            @PathVariable Long sessionId,
            @Valid @RequestBody CreatePaymentRequest request) {
        Payment payment = paymentService.recordPayment(
                sessionId,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getCollectedByStaffId(),
                request.getTip());
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    /**
     * GET /api/sessions/{sessionId}/payments - Get all payments for session
     */
    @GetMapping("/api/sessions/{sessionId}/payments")
    public ResponseEntity<java.util.List<Payment>> getSessionPayments(@PathVariable Long sessionId) {
        java.util.List<Payment> payments = paymentService.getPaymentsBySession(sessionId);
        return ResponseEntity.ok(payments);
    }
}
