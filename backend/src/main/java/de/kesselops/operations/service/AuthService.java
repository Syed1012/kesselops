package de.kesselops.operations.service;

import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.shared.dto.*;
import de.kesselops.shared.model.Role;
import de.kesselops.shared.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Register a new user.
     */
    @Transactional
    public UserSummaryResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role() != null ? request.role() : Role.OWNER);
        user.setPhone(request.phone());
        user.setVenueId(request.venueId());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        return toUserSummary(savedUser);
    }

    /**
     * Authenticate user and generate tokens.
     */
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.getIsActive()) {
            throw new IllegalStateException("Account is deactivated");
        }

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        return new LoginResponse(
                accessToken,
                refreshToken,
                jwtUtils.getAccessTokenExpirySeconds(),
                toUserSummary(user)
        );
    }

    /**
     * Refresh access token using refresh token.
     */
    public TokenPairResponse refresh(RefreshRequest request) {
        if (!jwtUtils.validateToken(request.refreshToken()) || !jwtUtils.isRefreshToken(request.refreshToken())) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        String email = jwtUtils.getEmailFromToken(request.refreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getIsActive()) {
            throw new IllegalStateException("Account is deactivated");
        }

        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user);

        return new TokenPairResponse(newAccessToken, newRefreshToken, jwtUtils.getAccessTokenExpirySeconds());
    }

    /**
     * Get current user profile.
     */
    public UserSummaryResponse getCurrentUser(User user) {
        return toUserSummary(user);
    }

    private UserSummaryResponse toUserSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getVenueId(),
                user.getIsActive(),
                user.getCreatedAt()
        );
    }
}
