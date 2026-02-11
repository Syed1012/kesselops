package de.kesselops.operations.controller;

import de.kesselops.operations.model.Handover;
import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.User;
import de.kesselops.operations.service.HandoverService;
import de.kesselops.operations.service.VenueAccessService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

/**
 * REST controller for handover management.
 */
@RestController
@RequestMapping("/api/shifts/{shiftId}/handover")
public class HandoverController {

    private final HandoverService handoverService;
    private final VenueAccessService venueAccessService;

    public HandoverController(HandoverService handoverService, VenueAccessService venueAccessService) {
        this.handoverService = handoverService;
        this.venueAccessService = venueAccessService;
    }

    /**
     * POST /api/shifts/{shiftId}/handover - Create a handover
     */
    @PostMapping
    public ResponseEntity<ApiResponse<HandoverResponse>> createHandover(
            @PathVariable Long shiftId,
            @Valid @RequestBody CreateHandoverRequest request,
            @AuthenticationPrincipal User user) {
        try {
            Shift fromShift = venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
            Shift toShift = venueAccessService.getAccessibleShiftOrThrow(user, request.toShiftId());

            if (!fromShift.getVenueId().equals(toShift.getVenueId())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Handover shifts must be in the same venue"));
            }

            Handover handover = handoverService.createHandover(
                    shiftId, request.toShiftId(), user.getId(),
                    request.summary(), request.openIssues(), request.nextSteps());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toHandoverResponse(handover)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * GET /api/shifts/{shiftId}/handover - Get handover for shift
     */
    @GetMapping
    public ResponseEntity<ApiResponse<HandoverResponse>> getHandover(
            @PathVariable Long shiftId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        Handover handover = handoverService.getHandoverByShift(shiftId);
        if (handover == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(toHandoverResponse(handover)));
    }

    /**
     * GET /api/shifts/{shiftId}/handover/incoming - Get incoming handover for shift
     */
    @GetMapping("/incoming")
    public ResponseEntity<ApiResponse<HandoverResponse>> getIncomingHandover(
            @PathVariable Long shiftId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        Handover handover = handoverService.getIncomingHandover(shiftId);
        if (handover == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success(toHandoverResponse(handover)));
    }

    /**
     * POST /api/shifts/{shiftId}/handover/acknowledge - Acknowledge handover
     */
    @PostMapping("/acknowledge")
    public ResponseEntity<ApiResponse<HandoverResponse>> acknowledgeHandover(
            @PathVariable Long shiftId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        Handover handover = handoverService.getIncomingHandover(shiftId);
        if (handover == null) {
            return ResponseEntity.notFound().build();
        }

        Handover acknowledged = handoverService.acknowledgeHandover(handover.getId(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(toHandoverResponse(acknowledged)));
    }

    private HandoverResponse toHandoverResponse(Handover handover) {
        return new HandoverResponse(
                handover.getId(),
                handover.getFromShiftId(),
                handover.getToShiftId(),
                handover.getAuthorUserId(),
                handover.getSummary(),
                handover.getOpenIssues(),
                handover.getNextSteps(),
                handover.getAcknowledgedByUserId(),
                handover.getAcknowledgedAt(),
                handover.getCreatedAt());
    }

    // DTOs
    public record CreateHandoverRequest(
            @NotNull Long toShiftId,
            @NotBlank String summary,
            String openIssues,
            String nextSteps) {
    }

    public record HandoverResponse(
            Long id,
            Long fromShiftId,
            Long toShiftId,
            Long authorUserId,
            String summary,
            String openIssues,
            String nextSteps,
            Long acknowledgedByUserId,
            Instant acknowledgedAt,
            Instant createdAt) {
    }
}
