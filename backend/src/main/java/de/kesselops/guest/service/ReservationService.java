package de.kesselops.guest.service;

import de.kesselops.guest.model.Reservation;
import de.kesselops.guest.model.ReservationStatus;
import de.kesselops.guest.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public Reservation createReservation(Long venueId, Long guestId,
            LocalDateTime reservationTime, Integer partySize) {
        Reservation reservation = Reservation.builder()
                .venueId(venueId)
                .guestId(guestId)
                .reservationTime(reservationTime)
                .partySize(partySize)
                .status(ReservationStatus.PENDING)
                .build();
        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByDate(Long venueId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        return reservationRepository.findByVenueIdAndReservationTimeBetween(
                venueId, startOfDay, endOfDay);
    }

    @Transactional(readOnly = true)
    public Reservation getReservation(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
    }
}
