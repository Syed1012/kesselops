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

    /**
     * Invite a new user with generated credentials.
     */
    @Transactional
    public InviteResponse inviteUser(InviteRequest request, User invitedBy) {
        // Validation
        if (request.role() == Role.OWNER) {
            throw new IllegalArgumentException("Cannot invite another Owner");
        }
        if (invitedBy.getRole() == Role.MANAGER && request.role() == Role.MANAGER) {
            throw new IllegalArgumentException("Managers cannot invite other Managers");
        }

        // Get venue name for email generation
        String venueName = "venue";
        // In a real app we'd fetch the venue name, but for now we'll use a placeholder or part of the inviter's email domain if possible
        // Let's rely on a consistent format: firstInitial.lastName@venueId.kesselops.de for uniqueness
        // Or better: generate unique email with retry
        
        String baseEmail = generateBaseEmail(request.firstName(), request.lastName(), invitedBy.getVenueId());
        String finalEmail = baseEmail;
        int counter = 1;
        
        while (userRepository.existsByEmail(finalEmail)) {
            finalEmail = baseEmail.replace("@", counter + "@");
            counter++;
        }

        String password = generateRandomPassword();

        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(finalEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(request.role());
        user.setVenueId(invitedBy.getVenueId());
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        return new InviteResponse(
                finalEmail,
                password,
                toUserSummary(savedUser)
        );
    }

    private String generateBaseEmail(String firstName, String lastName, Long venueId) {
        String cleanFirst = firstName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String cleanLast = lastName.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        return String.format("%s.%s@kesselops.de", 
                cleanFirst.isEmpty() ? "user" : cleanFirst.substring(0, 1), 
                cleanLast.isEmpty() ? "user" : cleanLast);
    }

    private String generateRandomPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$";
        StringBuilder sb = new StringBuilder();
        java.util.Random random = new java.security.SecureRandom();
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
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
