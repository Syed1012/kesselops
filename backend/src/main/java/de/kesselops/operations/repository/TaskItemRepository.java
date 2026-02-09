package de.kesselops.operations.repository;

import de.kesselops.operations.model.TaskItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for TaskItem entity operations.
 */
@Repository
public interface TaskItemRepository extends JpaRepository<TaskItem, Long> {

    List<TaskItem> findByChecklistIdOrderBySortOrderAsc(Long checklistId);
}
