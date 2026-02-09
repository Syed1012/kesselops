package de.kesselops.guest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {

    @NotNull(message = "items is required")
    @NotEmpty(message = "items cannot be empty")
    @Valid
    private List<OrderItemRequest> items;
}
