package de.kesselops.operations.controller;

import de.kesselops.operations.model.KanbanTaskStatus;
import de.kesselops.operations.model.Task;
import de.kesselops.operations.model.TaskPriority;
import de.kesselops.operations.model.User;
import de.kesselops.operations.service.TaskService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for standalone Kanban task management.
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // ─── DTOs ───────────────────────────────────────────────

    public record CreateTaskRequest(
            @NotBlank String title,
            String description,
            @NotNull String priority,
            @NotNull String category,
            boolean requiresPhoto,
            Long assigneeId,
            String dueDate,
            @NotNull Long venueId
    ) {}

    public record BatchCreateRequest(
            @NotNull Long venueId,
            @NotBlank String templateName,
            @NotNull List<TaskService.TaskTemplateItem> tasks
    ) {}

    public record UpdateTaskRequest(
            @NotBlank String title,
            String description,
            @NotNull String priority,
            @NotNull String category,
            boolean requiresPhoto,
            Long assigneeId,
            String dueDate
    ) {}

    public record UpdateStatusRequest(
            @NotNull String status
    ) {}

    public record TaskResponse(
            Long id,
            String title,
            String description,
            String priority,
            String status,
            String category,
            boolean requiresPhoto,
            String photoUrl,
            Long assigneeId,
            String assigneeName,
            String dueDate,
            Long venueId,
            Long createdByUserId,
            String createdFromTemplate,
            String createdAt,
            String updatedAt
    ) {}

    // ─── Endpoints ──────────────────────────────────────────

    /**
     * GET /api/tasks?venueId={venueId}&status={status}&category={category}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> listTasks(
            @RequestParam Long venueId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category
    ) {
        List<Task> tasks;

        if (status != null && !status.isBlank()) {
            tasks = taskService.getTasksByVenueAndStatus(venueId, KanbanTaskStatus.valueOf(status.toUpperCase()));
        } else {
            tasks = taskService.getTasksByVenue(venueId);
        }

        List<TaskResponse> response = tasks.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/tasks - Create a single task
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal User user
    ) {
        LocalDate dueDate = request.dueDate() != null ? LocalDate.parse(request.dueDate()) : LocalDate.now();
        Task task = taskService.createTask(
                request.title(),
                request.description(),
                TaskPriority.valueOf(request.priority().toUpperCase()),
                request.category().toUpperCase(),
                request.requiresPhoto(),
                request.assigneeId(),
                dueDate,
                request.venueId(),
                user.getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toResponse(task)));
    }

    /**
     * POST /api/tasks/batch - Create tasks from a template
     */
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> createBatch(
            @Valid @RequestBody BatchCreateRequest request,
            @AuthenticationPrincipal User user
    ) {
        List<Task> tasks = taskService.createTasksFromTemplate(
                request.tasks(),
                request.templateName(),
                request.venueId(),
                user.getId()
        );
        List<TaskResponse> response = tasks.stream().map(this::toResponse).toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * PUT /api/tasks/{id} - Update a task
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTaskRequest request
    ) {
        try {
            LocalDate dueDate = request.dueDate() != null ? LocalDate.parse(request.dueDate()) : null;
            Task task = taskService.updateTask(
                    id,
                    request.title(),
                    request.description(),
                    TaskPriority.valueOf(request.priority().toUpperCase()),
                    request.category().toUpperCase(),
                    request.requiresPhoto(),
                    request.assigneeId(),
                    dueDate
            );
            return ResponseEntity.ok(ApiResponse.success(toResponse(task)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * PATCH /api/tasks/{id}/status - Update task status (drag-and-drop)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateStatusRequest request
    ) {
        try {
            Task task = taskService.updateTaskStatus(id, KanbanTaskStatus.valueOf(request.status().toUpperCase()));
            return ResponseEntity.ok(ApiResponse.success(toResponse(task)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/tasks/{id}/photo - Upload photo for a task
     */
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TaskResponse>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "markDone", defaultValue = "true") boolean markDone
    ) {
        try {
            Task task = taskService.uploadPhoto(id, file, markDone);
            return ResponseEntity.ok(ApiResponse.success(toResponse(task)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/tasks/{id} - Delete a task
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.ok(ApiResponse.success(null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ─── Mapper ─────────────────────────────────────────────

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority().name(),
                task.getStatus().name(),
                task.getCategory(),
                task.isRequiresPhoto(),
                task.getPhotoUrl(),
                task.getAssigneeId(),
                null,  // assigneeName resolved on frontend
                task.getDueDate() != null ? task.getDueDate().toString() : null,
                task.getVenueId(),
                task.getCreatedByUserId(),
                task.getCreatedFromTemplate(),
                task.getCreatedAt().toString(),
                task.getUpdatedAt().toString()
        );
    }
}
