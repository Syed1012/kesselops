package de.kesselops.operations.model;

import jakarta.persistence.*;
import java.time.Instant;

/**
 * Handover entity for structured shift handover notes.
 */
@Entity
@Table(name = "handovers")
public class Handover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "from_shift_id", nullable = false)
    private Long fromShiftId;

    @Column(name = "to_shift_id")
    private Long toShiftId;

    @Column(name = "author_user_id", nullable = false)
    private Long authorUserId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String openIssues;

    @Column(columnDefinition = "TEXT")
    private String nextSteps;

    @Column(name = "acknowledged_by_user_id")
    private Long acknowledgedByUserId;

    private Instant acknowledgedAt;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // === Getters and Setters ===

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFromShiftId() {
        return fromShiftId;
    }

    public void setFromShiftId(Long fromShiftId) {
        this.fromShiftId = fromShiftId;
    }

    public Long getToShiftId() {
        return toShiftId;
    }

    public void setToShiftId(Long toShiftId) {
        this.toShiftId = toShiftId;
    }

    public Long getAuthorUserId() {
        return authorUserId;
    }

    public void setAuthorUserId(Long authorUserId) {
        this.authorUserId = authorUserId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getOpenIssues() {
        return openIssues;
    }

    public void setOpenIssues(String openIssues) {
        this.openIssues = openIssues;
    }

    public String getNextSteps() {
        return nextSteps;
    }

    public void setNextSteps(String nextSteps) {
        this.nextSteps = nextSteps;
    }

    public Long getAcknowledgedByUserId() {
        return acknowledgedByUserId;
    }

    public void setAcknowledgedByUserId(Long acknowledgedByUserId) {
        this.acknowledgedByUserId = acknowledgedByUserId;
    }

    public Instant getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(Instant acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
