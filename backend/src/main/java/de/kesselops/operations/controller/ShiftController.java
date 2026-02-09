package de.kesselops.operations.controller;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.ShiftType;
import de.kesselops.operations.service.ShiftService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

/**
 * REST controller for shift management.
 */
@RestController
@RequestMapping("/api/shifts")
public class ShiftController {

    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    /**
     * POST /api/shifts - Create a new shift
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> createShift(@Valid @RequestBody CreateShiftRequest request) {
        try {
            ShiftService.CreateShiftRequest serviceRequest = new ShiftService.CreateShiftRequest(
                    request.venueId(), request.startTime(), request.endTime(), request.type(), request.notes()
            );
            Shift shift = shiftService.createShift(serviceRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/shifts - List shifts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ShiftResponse>>> listShifts(
            @RequestParam Long venueId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            Pageable pageable
    ) {
        Page<ShiftResponse> shifts = shiftService.listShifts(venueId, from, to, pageable)
                .map(this::toShiftResponse);
        return ResponseEntity.ok(ApiResponse.success(shifts));
    }

    /**
     * GET /api/shifts/{id} - Get shift details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftResponse>> getShift(@PathVariable Long id) {
        try {
            Shift shift = shiftService.getShift(id);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * PUT /api/shifts/{id} - Update shift
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> updateShift(
            @PathVariable Long id,
            @RequestBody UpdateShiftRequest request
    ) {
        try {
            ShiftService.UpdateShiftRequest serviceRequest = new ShiftService.UpdateShiftRequest(
                    request.startTime(), request.endTime(), request.type(), request.notes()
            );
            Shift shift = shiftService.updateShift(id, serviceRequest);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/shifts/{id}/start - Start a shift
     */
    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> startShift(@PathVariable Long id) {
        try {
            Shift shift = shiftService.startShift(id);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * POST /api/shifts/{id}/end - End a shift
     */
    @PostMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<ShiftResponse>> endShift(@PathVariable Long id) {
        try {
            Shift shift = shiftService.endShift(id);
            return ResponseEntity.ok(ApiResponse.success(toShiftResponse(shift)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    private ShiftResponse toShiftResponse(Shift shift) {
        return new ShiftResponse(
                shift.getId(),
                shift.getVenueId(),
                shift.getStartTime(),
                shift.getEndTime(),
                shift.getType(),
                shift.getNotes(),
                shift.getIsActive(),
                shift.getDurationHours(),
                shift.getCreatedAt()
        );
    }

    // DTOs
    public record CreateShiftRequest(
            @NotNull Long venueId,
            @NotNull Instant startTime,
            @NotNull Instant endTime,
            @NotNull ShiftType type,
            String notes
    ) {}

    public record UpdateShiftRequest(
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes
    ) {}

    public record ShiftResponse(
            Long id,
            Long venueId,
            Instant startTime,
            Instant endTime,
            ShiftType type,
            String notes,
            boolean isActive,
            double durationHours,
            Instant createdAt
    ) {}
}
