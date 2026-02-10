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
     * Start or join a session via QR scan.
     * 
     * Flow:
     * 1. If NO active session: Create new session, generate 4-digit code.
     * 2. If ACTIVE session exists:
     * - If provided code matches session code -> Join success.
     * - If provided code mismatched/missing -> Throw 401 (Frontend prompts user).
     * 
     * @param tableId the table ID
     * @param code    the provided code (optional for new sessions)
     */
    public Session startSession(Long tableId, String code) {
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Table not found: " + tableId));

        // Check for existing active session
        Optional<Session> existingSession = sessionRepository.findByTableIdAndStatus(
                tableId, SessionStatus.ACTIVE);

        if (existingSession.isPresent()) {
            Session activeSession = existingSession.get();
            // Verify code to join existing session
            if (code == null || !code.equals(activeSession.getSessionCode())) {
                throw new SecurityException("Enter session code to join table");
            }
            return activeSession;
        }

        // Create new session with random 4-digit code
        String sessionCode = String.format("%04d", new java.security.SecureRandom().nextInt(10000));

        Session session = Session.builder()
                .tableId(tableId)
                .venueId(table.getVenueId())
                .status(SessionStatus.ACTIVE)
                .sessionCode(sessionCode)
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

    public Session findSessionByCode(String code) {
        return sessionRepository.findBySessionCodeAndStatus(code, SessionStatus.ACTIVE)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or inactive session code"));
    }

    public boolean hasActiveSession(Long tableId) {
        return sessionRepository.findByTableIdAndStatus(tableId, SessionStatus.ACTIVE).isPresent();
    }
}
