package de.kesselops.operations.service;

import de.kesselops.operations.model.KanbanTaskStatus;
import de.kesselops.operations.model.Task;
import de.kesselops.operations.model.TaskPriority;
import de.kesselops.operations.repository.TaskRepository;
import de.kesselops.shared.config.MinioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for standalone Kanban task management.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final MinioService minioService;

    public TaskService(TaskRepository taskRepository, MinioService minioService) {
        this.taskRepository = taskRepository;
        this.minioService = minioService;
    }

    /**
     * Get all tasks for a venue.
     */
    public List<Task> getTasksByVenue(Long venueId) {
        return taskRepository.findByVenueIdOrderByCreatedAtDesc(venueId);
    }

    /**
     * Get tasks by venue and status.
     */
    public List<Task> getTasksByVenueAndStatus(Long venueId, KanbanTaskStatus status) {
        return taskRepository.findByVenueIdAndStatusOrderByCreatedAtDesc(venueId, status);
    }

    /**
     * Get a task by ID.
     */
    public Task getTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + taskId));
    }

    /**
     * Create a single task.
     */
    @Transactional
    public Task createTask(String title, String description, TaskPriority priority,
                           String category, boolean requiresPhoto, Long assigneeId,
                           LocalDate dueDate, Long venueId, Long createdByUserId) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        task.setCategory(category);
        task.setRequiresPhoto(requiresPhoto);
        task.setAssigneeId(assigneeId);
        task.setDueDate(dueDate);
        task.setVenueId(venueId);
        task.setCreatedByUserId(createdByUserId);
        return taskRepository.save(task);
    }

    /**
     * Create tasks in batch from a template.
     */
    @Transactional
    public List<Task> createTasksFromTemplate(List<TaskTemplateItem> templateItems,
                                               String templateName,
                                               Long venueId,
                                               Long createdByUserId) {
        List<Task> created = new ArrayList<>();
        for (TaskTemplateItem item : templateItems) {
            Task task = new Task();
            task.setTitle(item.title());
            task.setDescription(item.description());
            task.setPriority(TaskPriority.valueOf(item.priority().toUpperCase()));
            task.setCategory(item.category().toUpperCase());
            task.setRequiresPhoto(item.requiresPhoto());
            task.setDueDate(LocalDate.now());
            task.setVenueId(venueId);
            task.setCreatedByUserId(createdByUserId);
            task.setCreatedFromTemplate(templateName);
            created.add(taskRepository.save(task));
        }
        return created;
    }

    /**
     * Update a task.
     */
    @Transactional
    public Task updateTask(Long taskId, String title, String description, TaskPriority priority,
                           String category, boolean requiresPhoto, Long assigneeId, LocalDate dueDate) {
        Task task = getTask(taskId);
        task.setTitle(title);
        task.setDescription(description);
        task.setPriority(priority);
        task.setCategory(category);
        task.setRequiresPhoto(requiresPhoto);
        task.setAssigneeId(assigneeId);
        task.setDueDate(dueDate);
        return taskRepository.save(task);
    }

    /**
     * Update task status (drag-and-drop).
     */
    @Transactional
    public Task updateTaskStatus(Long taskId, KanbanTaskStatus newStatus) {
        Task task = getTask(taskId);
        task.setStatus(newStatus);
        return taskRepository.save(task);
    }

    /**
     * Upload a photo for a task and optionally mark it done.
     */
    @Transactional
    public Task uploadPhoto(Long taskId, MultipartFile file, boolean markDone) {
        Task task = getTask(taskId);
        String url = minioService.uploadFile(file, "task-photos");
        task.setPhotoUrl(url);
        if (markDone) {
            task.setStatus(KanbanTaskStatus.DONE);
        }
        return taskRepository.save(task);
    }

    /**
     * Delete a task.
     */
    @Transactional
    public void deleteTask(Long taskId) {
        Task task = getTask(taskId);
        if (task.getPhotoUrl() != null) {
            minioService.deleteFile(task.getPhotoUrl());
        }
        taskRepository.delete(task);
    }

    /**
     * DTO for template items.
     */
    public record TaskTemplateItem(
            String title,
            String description,
            String priority,
            String category,
            boolean requiresPhoto
    ) {}
}
