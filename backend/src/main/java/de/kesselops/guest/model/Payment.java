package de.kesselops.guest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment entity - records payment against a session.
 * Supports both app payments and waiter/manual payments.
 */
@Entity
@Table(name = "payments", schema = "guest")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false)
    private Long sessionId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    /**
     * Staff who collected the payment (for waiter/manual payments).
     */
    @Column(name = "collected_by_staff_id")
    private Long collectedByStaffId;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    @Column(name = "tip", nullable = false)
    @Builder.Default
    private BigDecimal tip = BigDecimal.ZERO;

    @PrePersist
    protected void onCreate() {
        paidAt = LocalDateTime.now();
    }
}
