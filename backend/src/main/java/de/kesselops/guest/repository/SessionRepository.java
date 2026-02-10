package de.kesselops.guest.repository;

import de.kesselops.guest.model.Session;
import de.kesselops.guest.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {

    Optional<Session> findByTableIdAndStatus(Long tableId, SessionStatus status);

    Optional<Session> findByTableIdAndStatusAndVenueId(
            Long tableId, SessionStatus status, Long venueId);

    Optional<Session> findBySessionCodeAndStatus(String sessionCode, SessionStatus status);
}
