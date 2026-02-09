package de.kesselops.guest.dto;

import de.kesselops.guest.model.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "paymentMethod is required")
    private PaymentMethod paymentMethod;

    /**
     * Staff who collected the payment (for waiter/manual payments).
     * Optional for app payments.
     */
    private Long collectedByStaffId;
}
