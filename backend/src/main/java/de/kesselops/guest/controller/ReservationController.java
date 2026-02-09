package de.kesselops.guest.controller;

import de.kesselops.guest.dto.CreateReservationRequest;
import de.kesselops.guest.model.Reservation;
import de.kesselops.guest.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    /**
     * POST /api/reservations - Create a new reservation
     */
    @PostMapping
    public ResponseEntity<Reservation> createReservation(
            @Valid @RequestBody CreateReservationRequest request) {
        Reservation reservation = reservationService.createReservation(
                request.getVenueId(),
                request.getGuestId(),
                request.getReservationTime(),
                request.getPartySize());
        return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
    }

    /**
     * GET /api/reservations?date=YYYY-MM-DD - List reservations by date
     */
    @GetMapping
    public ResponseEntity<List<Reservation>> getReservations(
            @RequestParam Long venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Reservation> reservations = reservationService.getReservationsByDate(venueId, date);
        return ResponseEntity.ok(reservations);
    }
}
