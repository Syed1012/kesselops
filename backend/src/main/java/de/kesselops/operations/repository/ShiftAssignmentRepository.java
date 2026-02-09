package de.kesselops.operations.repository;

import de.kesselops.operations.model.ShiftAssignment;
import de.kesselops.operations.model.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ShiftAssignment entity operations.
 */
@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {

    List<ShiftAssignment> findByShiftId(Long shiftId);

    List<ShiftAssignment> findByUserId(Long userId);

    List<ShiftAssignment> findByShiftIdAndStatus(Long shiftId, AssignmentStatus status);

    boolean existsByShiftIdAndUserId(Long shiftId, Long userId);
}
