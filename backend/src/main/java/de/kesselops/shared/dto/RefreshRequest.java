package de.kesselops.shared.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for token refresh.
 */
public record RefreshRequest(
    @NotBlank String refreshToken
) {}
