package de.kesselops.shared.dto;

/**
 * Response DTO for login with tokens.
 */
public record LoginResponse(
    String accessToken,
    String refreshToken,
    long expiresIn,
    String tokenType,
    UserSummaryResponse user
) {
    public LoginResponse(String accessToken, String refreshToken, long expiresIn, UserSummaryResponse user) {
        this(accessToken, refreshToken, expiresIn, "Bearer", user);
    }
}
