package de.kesselops.operations.repository;

import de.kesselops.operations.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TaskItem entity operations.
 */
@Repository
public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {

    List<TaskItem> findByChecklistIdOrderBySortOrderAsc(Long checklistId);

    boolean existsByIdAndChecklistId(Long id, Long checklistId);

    @Modifying
    @Query("UPDATE TaskItem ti SET ti.completedByUserId = null WHERE ti.completedByUserId = :userId")
    int clearCompletedByUserId(@Param("userId") Long userId);
}
