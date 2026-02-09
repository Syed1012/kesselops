package de.kesselops.guest.service;

import de.kesselops.guest.model.Session;
import de.kesselops.guest.model.SessionStatus;
import de.kesselops.guest.model.TableEntity;
import de.kesselops.guest.repository.SessionRepository;
import de.kesselops.guest.repository.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final TableRepository tableRepository;

    /**
     * Start a new session via QR scan.
     * If an active session exists for the table, return it (shared cart behavior).
     */
    public Session startSession(Long tableId) {
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Table not found: " + tableId));

        // Check for existing active session
        Optional<Session> existingSession = sessionRepository.findByTableIdAndStatus(
                tableId, SessionStatus.ACTIVE);
        if (existingSession.isPresent()) {
            return existingSession.get();
        }

        // Create new session
        Session session = Session.builder()
                .tableId(tableId)
                .venueId(table.getVenueId())
                .status(SessionStatus.ACTIVE)
                .build();
        return sessionRepository.save(session);
    }

    @Transactional(readOnly = true)
    public Session getSession(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));
    }

    public Session closeSession(Long sessionId) {
        Session session = getSession(sessionId);
        session.setStatus(SessionStatus.CLOSED);
        session.setClosedAt(LocalDateTime.now());
        return sessionRepository.save(session);
    }

    /**
     * Verify session by staff (anti-fraud for QR photo abuse).
     */
    public Session verifySession(Long sessionId, Long staffId) {
        Session session = getSession(sessionId);
        session.setVerifiedByStaffId(staffId);
        return sessionRepository.save(session);
    }
}
