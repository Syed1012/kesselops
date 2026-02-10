package de.kesselops.guest.service;

import de.kesselops.guest.model.Reservation;
import de.kesselops.guest.model.ReservationStatus;
import de.kesselops.guest.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final SessionService sessionService;

    public Reservation createReservation(Long venueId, Long guestId, String guestName, String guestEmail,
            String guestPhone, String notes,
            LocalDateTime reservationTime, Integer partySize) {

        // Mock Table Assignment: Assign Table 1 or similar available table
        // In a real app, check availability logic would be here.
        Long assignedTableId = (long) (Math.abs(guestName != null ? guestName.hashCode() : partySize) % 5 + 1);

        Reservation reservation = Reservation.builder()
                .venueId(venueId != null ? venueId : 1L)
                .guestId(guestId)
                .guestName(guestName)
                .guestEmail(guestEmail)
                .guestPhone(guestPhone)
                .notes(notes)
                .tableId(assignedTableId)
                .reservationTime(reservationTime)
                .partySize(partySize)
                .status(ReservationStatus.PENDING)
                .build();

        reservation = reservationRepository.save(reservation);

        // Send Email (Mock)
        if (guestEmail != null) {
            log.info("Sending reservation confirmation email to {} for Table {} at {}",
                    guestEmail, assignedTableId, reservationTime);
        }

        return reservation;
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

    /**
     * Periodically check for due reservations and start sessions.
     * Runs every minute.
     */
    @Scheduled(fixedRate = 60000)
    public void startDueReservations() {
        LocalDateTime now = LocalDateTime.now();
        // Ideally use a repository query: findByStatusAndReservationTimeBefore(PENDING,
        // now)
        // For simplicity, fetching all pending reservations and filtering in memory
        // (Assuming low volume for MVP).
        List<Reservation> pending = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING)
                .filter(r -> r.getReservationTime().isBefore(now.plusMinutes(5))) // Start 5 mins early?
                .filter(r -> r.getReservationTime().isAfter(now.minusHours(1))) // Don't process very old ones
                .toList();

        for (Reservation r : pending) {
            try {
                if (r.getTableId() != null) {
                    sessionService.startSession(r.getTableId(), null);
                    r.setStatus(ReservationStatus.CONFIRMED); // Mark as started/confirmed
                    reservationRepository.save(r);
                    log.info("Auto-started session for reservation {} at Table {}", r.getId(), r.getTableId());
                }
            } catch (Exception e) {
                log.warn("Could not auto-start session for reservation {}: {}", r.getId(), e.getMessage());
                // Likely session already active
            }
        }
    }
}
