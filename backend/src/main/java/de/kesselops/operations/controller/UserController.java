package de.kesselops.operations.controller;

import de.kesselops.operations.model.User;
import de.kesselops.operations.service.UserService;
import de.kesselops.shared.dto.ApiResponse;
import de.kesselops.shared.dto.UserSummaryResponse;
import de.kesselops.shared.model.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for user management.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users - List all users (filtered by role permissions)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CHEF', 'STAFF', 'TRAINEE')")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> listUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Long venueId
    ) {
        try {
            List<UserSummaryResponse> users = userService.listUsers(currentUser, venueId);
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/users/{id} - Get a single user
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            UserSummaryResponse user = userService.getUser(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PUT /api/users/{id} - Update user details
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody UpdateUserRequest request
    ) {
        try {
            UserSummaryResponse user = userService.updateUser(
                    id, request.firstName(), request.lastName(), request.phone(), request.role(), currentUser
            );
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PATCH /api/users/{id}/deactivate - Deactivate a user
     */
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            userService.deactivateUser(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PATCH /api/users/{id}/activate - Activate a user
     */
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> activateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            userService.activateUser(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/users/{id} - Permanently delete a user
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            userService.deleteUser(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // DTO for update request
    public record UpdateUserRequest(String firstName, String lastName, String phone, Role role) {}
}
