package de.kesselops.shared.dto;

public record InviteResponse(
    String email,
    String password,
    UserSummaryResponse user
) {}
