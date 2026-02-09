package de.kesselops.operations.service;

import de.kesselops.operations.model.*;
import de.kesselops.operations.repository.ChecklistRepository;
import de.kesselops.operations.repository.TaskItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Service for checklist and task management.
 */
@Service
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final TaskItemRepository taskItemRepository;

    public ChecklistService(ChecklistRepository checklistRepository, TaskItemRepository taskItemRepository) {
        this.checklistRepository = checklistRepository;
        this.taskItemRepository = taskItemRepository;
    }

    /**
     * Create a checklist for a shift.
     */
    @Transactional
    public Checklist createChecklist(Long shiftId, ChecklistCategory category, String title) {
        Checklist checklist = new Checklist();
        checklist.setShiftId(shiftId);
        checklist.setCategory(category);
        checklist.setTitle(title);
        return checklistRepository.save(checklist);
    }

    /**
     * Get checklists for a shift.
     */
    public List<Checklist> getChecklistsByShift(Long shiftId) {
        return checklistRepository.findByShiftId(shiftId);
    }

    /**
     * Get a checklist by ID with tasks.
     */
    public Checklist getChecklist(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Checklist not found"));
        // Eager load tasks
        checklist.getTasks().size();
        return checklist;
    }

    /**
     * Add a task to a checklist.
     */
    @Transactional
    public TaskItem addTask(Long checklistId, String description, int sortOrder, boolean requiresPhoto) {
        TaskItem task = new TaskItem();
        task.setChecklistId(checklistId);
        task.setDescription(description);
        task.setSortOrder(sortOrder);
        task.setRequiresPhoto(requiresPhoto);
        return taskItemRepository.save(task);
    }

    /**
     * Mark a task as done.
     */
    @Transactional
    public TaskItem markTaskDone(Long taskId, Long userId) {
        TaskItem task = taskItemRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(TaskStatus.DONE);
        task.setCompletedAt(Instant.now());
        task.setCompletedByUserId(userId);
        return taskItemRepository.save(task);
    }

    /**
     * Skip a task.
     */
    @Transactional
    public TaskItem skipTask(Long taskId) {
        TaskItem task = taskItemRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(TaskStatus.SKIPPED);
        return taskItemRepository.save(task);
    }

    /**
     * Check and update checklist completion status.
     */
    @Transactional
    public void updateChecklistCompletion(Long checklistId) {
        Checklist checklist = getChecklist(checklistId);
        boolean allDone = checklist.getTasks().stream()
                .allMatch(t -> t.getStatus() != TaskStatus.NOT_DONE);
        checklist.setIsCompleted(allDone);
        checklistRepository.save(checklist);
    }
}
