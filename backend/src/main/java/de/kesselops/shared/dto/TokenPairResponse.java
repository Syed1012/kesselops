package de.kesselops.shared.dto;

/**
 * Response DTO for token pair (access + refresh).
 */
public record TokenPairResponse(
    String accessToken,
    String refreshToken,
    long expiresIn
) {}
