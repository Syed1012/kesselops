package de.kesselops.guest.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {

    private Long guestId;

    @NotNull(message = "venueId is required")
    private Long venueId;

    @NotNull(message = "reservationTime is required")
    @Future(message = "reservationTime must be in the future")
    private LocalDateTime reservationTime;

    @NotNull(message = "partySize is required")
    @Min(value = 1, message = "partySize must be at least 1")
    private Integer partySize;
}
