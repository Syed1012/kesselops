package de.kesselops.operations.service;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.ChecklistRepository;
import de.kesselops.operations.repository.ShiftRepository;
import de.kesselops.operations.repository.TaskItemRepository;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.operations.repository.VenueRepository;
import de.kesselops.shared.model.Role;
import org.springframework.stereotype.Service;

/**
 * Shared venue access checks to enforce tenant isolation.
 */
@Service
public class VenueAccessService {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final ChecklistRepository checklistRepository;
    private final TaskItemRepository taskItemRepository;

    public VenueAccessService(VenueRepository venueRepository,
                              UserRepository userRepository,
                              ShiftRepository shiftRepository,
                              ChecklistRepository checklistRepository,
                              TaskItemRepository taskItemRepository) {
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.shiftRepository = shiftRepository;
        this.checklistRepository = checklistRepository;
        this.taskItemRepository = taskItemRepository;
    }

    public boolean canAccessVenue(User user, Long venueId) {
        if (user == null || venueId == null) {
            return false;
        }

        if (user.getRole() == Role.OWNER) {
            return venueRepository.existsByIdAndOwnerId(venueId, user.getId());
        }

        return user.getVenueId() != null && user.getVenueId().equals(venueId);
    }

    public boolean userBelongsToVenue(Long userId, Long venueId) {
        if (userId == null) {
            return true;
        }
        if (venueId == null) {
            return false;
        }
        return userRepository.existsByIdAndVenueId(userId, venueId);
    }

    public Shift getShiftOrThrow(Long shiftId) {
        return shiftRepository.findById(shiftId)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));
    }

    public Shift getAccessibleShiftOrThrow(User user, Long shiftId) {
        Shift shift = getShiftOrThrow(shiftId);
        if (!canAccessVenue(user, shift.getVenueId())) {
            throw new IllegalArgumentException("Access denied to this shift");
        }
        return shift;
    }

    public boolean checklistBelongsToShift(Long checklistId, Long shiftId) {
        return checklistRepository.existsByIdAndShiftId(checklistId, shiftId);
    }

    public boolean taskBelongsToChecklist(Long taskId, Long checklistId) {
        return taskItemRepository.existsByIdAndChecklistId(taskId, checklistId);
    }
}
