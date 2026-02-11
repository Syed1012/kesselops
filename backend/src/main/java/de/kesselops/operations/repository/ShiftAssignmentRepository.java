package de.kesselops.operations.repository;

import de.kesselops.operations.model.ShiftAssignment;
import de.kesselops.operations.model.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
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

    void deleteByUserId(Long userId);

    void deleteByShiftIdIn(Collection<Long> shiftIds);

    @Modifying
    @Query("UPDATE ShiftAssignment sa SET sa.assignedByUserId = null WHERE sa.assignedByUserId = :userId")
    int clearAssignedByUserId(@Param("userId") Long userId);
}
