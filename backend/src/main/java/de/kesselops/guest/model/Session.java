package de.kesselops.guest.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Session entity - active table session started via QR scan.
 * Multiple guests can share a session (shared cart behavior).
 */
@Entity
@Table(name = "sessions", schema = "guest")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(name = "reservation_id")
    private Long reservationId;

    @Column(name = "assigned_staff_id")
    private Long assignedStaffId;

    /**
     * Optional verification by staff (anti-fraud for QR photo abuse).
     */
    @Column(name = "verified_by_staff_id")
    private Long verifiedByStaffId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
        if (status == null) {
            status = SessionStatus.ACTIVE;
        }
    }
}
