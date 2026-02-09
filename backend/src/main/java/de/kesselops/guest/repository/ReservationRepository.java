package de.kesselops.guest.repository;

import de.kesselops.guest.model.Reservation;
import de.kesselops.guest.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByVenueIdAndReservationTimeBetween(
            Long venueId, LocalDateTime start, LocalDateTime end);

    List<Reservation> findByVenueIdAndStatus(Long venueId, ReservationStatus status);
}
