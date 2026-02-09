package de.kesselops.operations.controller;

import de.kesselops.operations.model.User;
import de.kesselops.operations.service.AuthService;
import de.kesselops.shared.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for authentication endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/register - Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            UserSummaryResponse user = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login - Authenticate and receive tokens
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/refresh - Refresh access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenPairResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        try {
            TokenPairResponse response = authService.refresh(request);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/auth/logout - Invalidate refresh token (client-side only for now)
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // For stateless JWT, logout is handled client-side by discarding tokens
        // Server-side token blacklisting can be added with Redis
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/auth/me - Get current user profile
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getCurrentUser(@AuthenticationPrincipal User user) {
        UserSummaryResponse response = authService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
