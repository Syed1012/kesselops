package de.kesselops.operations.service;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.ChecklistRepository;
import de.kesselops.operations.repository.HandoverRepository;
import de.kesselops.operations.repository.ShiftAssignmentRepository;
import de.kesselops.operations.repository.ShiftRepository;
import de.kesselops.operations.repository.TaskItemRepository;
import de.kesselops.operations.repository.TaskRepository;
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
    private final TaskRepository taskRepository;
    private final ShiftRepository shiftRepository;
    private final ShiftAssignmentRepository shiftAssignmentRepository;
    private final HandoverRepository handoverRepository;
    private final ChecklistRepository checklistRepository;
    private final TaskItemRepository taskItemRepository;
    private final VenueAccessService venueAccessService;

    public UserService(UserRepository userRepository,
                       TaskRepository taskRepository,
                       ShiftRepository shiftRepository,
                       ShiftAssignmentRepository shiftAssignmentRepository,
                       HandoverRepository handoverRepository,
                       ChecklistRepository checklistRepository,
                       TaskItemRepository taskItemRepository,
                       VenueAccessService venueAccessService) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
        this.shiftRepository = shiftRepository;
        this.shiftAssignmentRepository = shiftAssignmentRepository;
        this.handoverRepository = handoverRepository;
        this.checklistRepository = checklistRepository;
        this.taskItemRepository = taskItemRepository;
        this.venueAccessService = venueAccessService;
    }

    /**
     * List all users (filtered by venue for non-owners).
     */
    public List<UserSummaryResponse> listUsers(User currentUser, Long venueId) {
        Long effectiveVenueId;

        if (currentUser.getRole() == Role.OWNER) {
            effectiveVenueId = venueId != null ? venueId : currentUser.getVenueId();
            if (effectiveVenueId == null) {
                return List.of();
            }
            if (!venueAccessService.canAccessVenue(currentUser, effectiveVenueId)) {
                throw new IllegalArgumentException("Access denied to venue");
            }
        } else {
            effectiveVenueId = currentUser.getVenueId();
            if (effectiveVenueId == null) {
                return List.of();
            }
        }

        List<User> users = userRepository.findTeamUsersByVenueId(effectiveVenueId);

        return users.stream().map(this::toUserSummary).toList();
    }

    /**
     * Get a single user by ID.
     */
    public UserSummaryResponse getUser(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCanManageUser(currentUser, user);
        return toUserSummary(user);
    }

    /**
     * Update user details.
     */
    @Transactional
    public UserSummaryResponse updateUser(Long id, String firstName, String lastName, String phone, Role role, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCanManageUser(currentUser, user);

        if (currentUser.getRole() == Role.MANAGER && role != null &&
                (role == Role.OWNER || role == Role.MANAGER)) {
            throw new IllegalArgumentException("Managers cannot promote users to Manager or Owner");
        }

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
    public void deactivateUser(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCanManageUser(currentUser, user);

        if (currentUser.getRole() == Role.MANAGER && user.getRole() == Role.MANAGER) {
            throw new IllegalArgumentException("Managers cannot deactivate other Managers");
        }

        user.setIsActive(false);
        userRepository.save(user);
    }

    /**
     * Activate a user.
     */
    @Transactional
    public void activateUser(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ensureCanManageUser(currentUser, user);

        if (currentUser.getRole() == Role.MANAGER && user.getRole() == Role.MANAGER) {
            throw new IllegalArgumentException("Managers cannot activate other Managers");
        }

        user.setIsActive(true);
        userRepository.save(user);
    }

    /**
     * Permanently delete a user.
     */
    @Transactional
    public void deleteUser(Long id, User currentUser) {
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ensureCanManageUser(currentUser, userToDelete);

        // Cannot delete yourself
        if (userToDelete.getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Cannot delete yourself");
        }

        // Cannot delete an owner
        if (userToDelete.getRole() == Role.OWNER) {
            throw new IllegalArgumentException("Cannot delete an Owner");
        }

        // Managers cannot delete other managers
        if (currentUser.getRole() == Role.MANAGER && userToDelete.getRole() == Role.MANAGER) {
            throw new IllegalArgumentException("Managers cannot delete other Managers");
        }

        cleanupUserDependencies(userToDelete.getId(), currentUser.getId());
        userRepository.delete(userToDelete);
    }

    private void cleanupUserDependencies(Long userId, Long replacementUserId) {
        // Remove standalone tasks assigned to this user and keep creator FK valid for remaining tasks.
        taskRepository.deleteByAssigneeId(userId);
        taskRepository.reassignCreatedByUser(userId, replacementUserId);

        // Null out optional audit references to avoid FK violations.
        taskItemRepository.clearCompletedByUserId(userId);
        shiftAssignmentRepository.clearAssignedByUserId(userId);
        handoverRepository.clearAcknowledgedByUserId(userId);

        // Delete shifts owned by this user, including all dependent records.
        List<Shift> userShifts = shiftRepository.findByUserId(userId);
        if (!userShifts.isEmpty()) {
            List<Long> shiftIds = userShifts.stream().map(Shift::getId).toList();
            handoverRepository.deleteByFromShiftIdInOrToShiftIdIn(shiftIds, shiftIds);
            shiftAssignmentRepository.deleteByShiftIdIn(shiftIds);
            checklistRepository.deleteByShiftIdIn(shiftIds);
            shiftRepository.deleteAll(userShifts);
        }

        // Remove remaining rows that directly reference the user.
        handoverRepository.deleteByAuthorUserId(userId);
        shiftAssignmentRepository.deleteByUserId(userId);
    }

    private void ensureCanManageUser(User currentUser, User targetUser) {
        if (targetUser.getVenueId() == null || !venueAccessService.canAccessVenue(currentUser, targetUser.getVenueId())) {
            throw new IllegalArgumentException("Access denied to user");
        }
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
