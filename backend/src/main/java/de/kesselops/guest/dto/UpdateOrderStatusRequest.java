package de.kesselops.guest.dto;

import de.kesselops.guest.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {

    @NotNull(message = "status is required")
    private OrderStatus status;
}
