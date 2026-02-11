package de.kesselops.operations.controller;

import de.kesselops.operations.model.User;
import de.kesselops.operations.model.Venue;
import de.kesselops.operations.service.VenueService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for venue management.
 */
@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;

    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    /**
     * POST /api/venues - Create a new venue
     */
    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VenueResponse>> createVenue(
            @Valid @RequestBody CreateVenueRequest request,
            @AuthenticationPrincipal User owner) {
        VenueService.CreateVenueRequest serviceRequest = new VenueService.CreateVenueRequest(
                request.name(), request.address(), request.city(), request.type(), request.timezone());
        Venue venue = venueService.createVenue(serviceRequest, owner);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toVenueResponse(venue)));
    }

    /**
     * GET /api/venues - List venues accessible to user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<VenueResponse>>> listVenues(@AuthenticationPrincipal User user) {
        List<VenueResponse> venues = venueService.listVenues(user).stream()
                .map(this::toVenueResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    /**
     * GET /api/venues/{id} - Get venue details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VenueResponse>> getVenue(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            Venue venue = venueService.getVenue(id, user);
            return ResponseEntity.ok(ApiResponse.success(toVenueResponse(venue)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * PUT /api/venues/{id} - Update venue
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<VenueResponse>> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody CreateVenueRequest request,
            @AuthenticationPrincipal User user) {
        try {
            VenueService.CreateVenueRequest serviceRequest = new VenueService.CreateVenueRequest(
                    request.name(), request.address(), request.city(), request.type(), request.timezone());
            Venue venue = venueService.updateVenue(id, serviceRequest, user);
            return ResponseEntity.ok(ApiResponse.success(toVenueResponse(venue)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    private VenueResponse toVenueResponse(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getCity(),
                venue.getType(),
                venue.getTimezone(),
                venue.getCreatedAt());
    }

    // DTOs
    public record CreateVenueRequest(
            @NotBlank String name,
            @NotBlank String address,
            @NotBlank String city,
            @NotBlank String type,
            String timezone) {
    }

    public record VenueResponse(
            Long id,
            String name,
            String address,
            String city,
            String type,
            String timezone,
            java.time.Instant createdAt) {
    }
}
