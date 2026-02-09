package de.kesselops.operations.service;

import de.kesselops.operations.model.Handover;
import de.kesselops.operations.repository.HandoverRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service for handover management.
 */
@Service
public class HandoverService {

    private final HandoverRepository handoverRepository;

    public HandoverService(HandoverRepository handoverRepository) {
        this.handoverRepository = handoverRepository;
    }

    /**
     * Create a handover from current shift.
     */
    @Transactional
    public Handover createHandover(Long fromShiftId, Long toShiftId, Long authorUserId, 
                                    String summary, String openIssues, String nextSteps) {
        Handover handover = new Handover();
        handover.setFromShiftId(fromShiftId);
        handover.setToShiftId(toShiftId);
        handover.setAuthorUserId(authorUserId);
        handover.setSummary(summary);
        handover.setOpenIssues(openIssues);
        handover.setNextSteps(nextSteps);

        return handoverRepository.save(handover);
    }

    /**
     * Get handover by shift ID.
     */
    public Handover getHandoverByShift(Long shiftId) {
        return handoverRepository.findByFromShiftId(shiftId).orElse(null);
    }

    /**
     * Get incoming handover for a shift.
     */
    public Handover getIncomingHandover(Long toShiftId) {
        return handoverRepository.findByToShiftId(toShiftId).orElse(null);
    }

    /**
     * Acknowledge a handover.
     */
    @Transactional
    public Handover acknowledgeHandover(Long handoverId, Long userId) {
        Handover handover = handoverRepository.findById(handoverId)
                .orElseThrow(() -> new IllegalArgumentException("Handover not found"));
        
        handover.setAcknowledgedByUserId(userId);
        handover.setAcknowledgedAt(Instant.now());
        
        return handoverRepository.save(handover);
    }
}
