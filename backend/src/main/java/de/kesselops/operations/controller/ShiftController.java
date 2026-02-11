package de.kesselops.operations.controller;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.ShiftType;
import de.kesselops.operations.model.User;
import de.kesselops.operations.service.ShiftService;
import de.kesselops.operations.service.VenueAccessService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST controller for shift management.
 */
@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;
    private final VenueAccessService venueAccessService;

    public ShiftController(ShiftService shiftService, VenueAccessService venueAccessService) {
        this.shiftService = shiftService;
        this.venueAccessService = venueAccessService;
    }

    /**
     * POST /api/shifts - Create a new shift
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(
            @Valid @RequestBody CreateShiftRequest request,
            @AuthenticationPrincipal User user) {
        if (!venueAccessService.canAccessVenue(user, request.venueId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("ACCESS_DENIED", "Access denied to venue"));
        }
        if (!venueAccessService.userBelongsToVenue(request.userId(), request.venueId())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("INVALID_REQUEST", "Assigned user does not belong to this venue"));
        }

        try {
            ShiftService.CreateShiftRequest serviceRequest = new ShiftService.CreateShiftRequest(
                    request.venueId(), request.userId(), request.startTime(), request.endTime(), request.type(),
                    request.notes());
            Shift shift = shiftService.createShift(serviceRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("CONFLICT", e.getMessage()));
        }
    }

    /**
     * GET /api/shifts - List shifts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ShiftResponse>>> listShifts(
            @RequestParam Long venueId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        if (!venueAccessService.canAccessVenue(user, venueId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("ACCESS_DENIED", "Access denied to venue"));
        }

        Page<ShiftResponse> shifts = shiftService.listShifts(venueId, from, to, pageable)
                .map(this::toShiftResponse);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(shifts)));
    }

    /**
     * GET /api/shifts/{id} - Get shift details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftResponse>> getShift(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Shift shift = shiftService.getShift(id);
            if (!venueAccessService.canAccessVenue(user, shift.getVenueId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("ACCESS_DENIED", "Access denied to shift"));
            }
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * PUT /api/shifts/{id} - Update shift
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> updateShift(
            @PathVariable Long id,
            @RequestBody UpdateShiftRequest request,
            @AuthenticationPrincipal User user) {
        try {
            Shift existing = shiftService.getShift(id);
            if (!venueAccessService.canAccessVenue(user, existing.getVenueId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("ACCESS_DENIED", "Access denied to shift"));
            }
            ShiftService.UpdateShiftRequest serviceRequest = new ShiftService.UpdateShiftRequest(
                    request.startTime(), request.endTime(), request.type(), request.notes());
            Shift shift = shiftService.updateShift(id, serviceRequest);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * POST /api/shifts/{id}/start - Start a shift
     */
    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> startShift(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Shift existing = shiftService.getShift(id);
            if (!venueAccessService.canAccessVenue(user, existing.getVenueId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("ACCESS_DENIED", "Access denied to shift"));
            }
            Shift shift = shiftService.startShift(id);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * POST /api/shifts/{id}/end - End a shift
     */
    @PostMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> endShift(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Shift existing = shiftService.getShift(id);
            if (!venueAccessService.canAccessVenue(user, existing.getVenueId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("ACCESS_DENIED", "Access denied to shift"));
            }
            Shift shift = shiftService.endShift(id);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * DELETE /api/shifts/{id} - Delete a shift
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteShift(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Shift existing = shiftService.getShift(id);
            if (!venueAccessService.canAccessVenue(user, existing.getVenueId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("ACCESS_DENIED", "Access denied to shift"));
            }
            shiftService.deleteShift(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    private ShiftResponse toShiftResponse(Shift shift) {
        return new ShiftResponse(
                shift.getId(),
                shift.getVenueId(),
                shift.getUserId(),
                shift.getStartTime(),
                shift.getEndTime(),
                shift.getType(),
                shift.getNotes(),
                shift.getIsActive(),
                shift.getDurationHours(),
                shift.getCreatedAt());
    }

    // DTOs
    public record CreateShiftRequest(
            @NotNull Long venueId,
            Long userId,
            @NotNull Instant startTime,
            @NotNull Instant endTime,
            @NotNull ShiftType type,
            String notes) {
    }

    public record UpdateShiftRequest(
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes) {
    }

    public record ShiftResponse(
            Long id,
            Long venueId,
            Long userId,
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes,
            boolean isActive,
            double durationHours,
            Instant createdAt) {
    }

    public record PageResponse<T>(
            List<T> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last) {
        public static <T> PageResponse<T> from(Page<T> page) {
            return new PageResponse<>(
                    page.getContent(),
                    page.getNumber(),
                    page.getSize(),
                    page.getTotalElements(),
                    page.getTotalPages(),
                    page.isFirst(),
                    page.isLast());
        }
    }
}
