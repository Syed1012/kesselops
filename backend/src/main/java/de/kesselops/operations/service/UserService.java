package de.kesselops.operations.service;

import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.shared.dto.UserSummaryResponse;
import de.kesselops.shared.model.Role;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for user management operations.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * List all users (filtered by venue for non-owners).
     */
    public List<UserSummaryResponse> listUsers(User currentUser, Long venueId) {
        List<User> users;
        
        if (currentUser.getRole() == Role.OWNER) {
            users = venueId != null 
                    ? userRepository.findByVenueId(venueId) 
                    : userRepository.findAll();
        } else {
            // Managers can only see their venue's staff
            users = userRepository.findByVenueId(currentUser.getVenueId());
        }
        
        return users.stream().map(this::toUserSummary).toList();
    }

    /**
     * Get a single user by ID.
     */
    public UserSummaryResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toUserSummary(user);
    }

    /**
     * Update user details.
     */
    @Transactional
    public UserSummaryResponse updateUser(Long id, String firstName, String lastName, String phone, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        if (role != null) user.setRole(role);

        User savedUser = userRepository.save(user);
        return toUserSummary(savedUser);
    }

    /**
     * Deactivate a user.
     */
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Activate a user.
     */
    @Transactional
    public void activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
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
