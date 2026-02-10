package de.kesselops.guest.controller;

import de.kesselops.guest.model.Session;
import de.kesselops.guest.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    /**
     * POST /api/tables/{tableId}/sessions/start?code=XXXX - Start session via QR
     * scan
     * Requires valid 4-digit table code for security.
     */
    @PostMapping("/api/tables/{tableId}/sessions/start")
    public ResponseEntity<Session> startSession(
            @PathVariable Long tableId,
            @RequestParam(value = "code", required = false) String code) {
        Session session = sessionService.startSession(tableId, code);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    /**
     * GET /api/sessions/{sessionId} - Get session details
     */
    @GetMapping("/api/sessions/{sessionId}")
    public ResponseEntity<Session> getSession(@PathVariable Long sessionId) {
        Session session = sessionService.getSession(sessionId);
        return ResponseEntity.ok(session);
    }
}
