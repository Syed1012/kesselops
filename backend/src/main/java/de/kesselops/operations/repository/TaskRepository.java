package de.kesselops.operations.repository;

import de.kesselops.operations.model.Task;
import de.kesselops.operations.model.KanbanTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for standalone Task entity (Kanban board).
 * Note: This is NOT the TaskItemRepository which handles checklist tasks.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByVenueIdOrderByCreatedAtDesc(Long venueId);

    List<Task> findByVenueIdAndStatusOrderByCreatedAtDesc(Long venueId, KanbanTaskStatus status);

    List<Task> findByVenueIdAndCategoryOrderByCreatedAtDesc(Long venueId, String category);

    List<Task> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);
}
