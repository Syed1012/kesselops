package de.kesselops.shared.dto;

import de.kesselops.shared.model.Role;
import java.time.Instant;

/**
 * Response DTO for user summary.
 */
public record UserSummaryResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    Role role,
    Long venueId,
    boolean isActive,
    Instant createdAt
) {}
