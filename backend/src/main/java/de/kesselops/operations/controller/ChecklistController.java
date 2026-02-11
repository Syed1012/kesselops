package de.kesselops.operations.controller;

import de.kesselops.operations.model.*;
import de.kesselops.operations.service.ChecklistService;
import de.kesselops.operations.service.VenueAccessService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST controller for checklist management.
 */
@RestController
@RequestMapping("/api/shifts/{shiftId}/checklists")
public class ChecklistController {

    private final ChecklistService checklistService;
    private final VenueAccessService venueAccessService;

    public ChecklistController(ChecklistService checklistService, VenueAccessService venueAccessService) {
        this.checklistService = checklistService;
        this.venueAccessService = venueAccessService;
    }

    /**
     * POST /api/shifts/{shiftId}/checklists - Create a checklist
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChecklistResponse>> createChecklist(
            @PathVariable Long shiftId,
            @Valid @RequestBody CreateChecklistRequest request,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        Checklist checklist = checklistService.createChecklist(shiftId, request.category(), request.title());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toChecklistResponse(checklist)));
    }

    /**
     * GET /api/shifts/{shiftId}/checklists - List checklists for shift
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChecklistResponse>>> listChecklists(
            @PathVariable Long shiftId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        List<ChecklistResponse> checklists = checklistService.getChecklistsByShift(shiftId).stream()
                .map(this::toChecklistResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(checklists));
    }

    /**
     * GET /api/shifts/{shiftId}/checklists/{id} - Get checklist with tasks
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChecklistDetailResponse>> getChecklist(
            @PathVariable Long shiftId,
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
            if (!venueAccessService.checklistBelongsToShift(id, shiftId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Checklist does not belong to shift"));
            }
            Checklist checklist = checklistService.getChecklist(id);
            return ResponseEntity.ok(ApiResponse.success(toChecklistDetailResponse(checklist)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * POST /api/shifts/{shiftId}/checklists/{id}/tasks - Add task to checklist
     */
    @PostMapping("/{id}/tasks")
    public ResponseEntity<ApiResponse<TaskResponse>> addTask(
            @PathVariable Long shiftId,
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateTaskRequest request) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
            if (!venueAccessService.checklistBelongsToShift(id, shiftId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Checklist does not belong to shift"));
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("ACCESS_DENIED", e.getMessage()));
        }

        TaskItem task = checklistService.addTask(id, request.description(), request.sortOrder(),
                request.requiresPhoto());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(toTaskResponse(task)));
    }

    /**
     * PATCH /api/shifts/{shiftId}/checklists/{checklistId}/tasks/{taskId}/done -
     * Mark task done
     */
    @PatchMapping("/{checklistId}/tasks/{taskId}/done")
    public ResponseEntity<ApiResponse<TaskResponse>> markTaskDone(
            @PathVariable Long shiftId,
            @PathVariable Long checklistId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
            if (!venueAccessService.checklistBelongsToShift(checklistId, shiftId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Checklist does not belong to shift"));
            }
            if (!venueAccessService.taskBelongsToChecklist(taskId, checklistId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Task does not belong to checklist"));
            }

            TaskItem task = checklistService.markTaskDone(taskId, user.getId());
            checklistService.updateChecklistCompletion(checklistId);
            return ResponseEntity.ok(ApiResponse.success(toTaskResponse(task)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * PATCH /api/shifts/{shiftId}/checklists/{checklistId}/tasks/{taskId}/skip -
     * Skip task
     */
    @PatchMapping("/{checklistId}/tasks/{taskId}/skip")
    public ResponseEntity<ApiResponse<TaskResponse>> skipTask(
            @PathVariable Long shiftId,
            @PathVariable Long checklistId,
            @PathVariable Long taskId,
            @AuthenticationPrincipal User user) {
        try {
            venueAccessService.getAccessibleShiftOrThrow(user, shiftId);
            if (!venueAccessService.checklistBelongsToShift(checklistId, shiftId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Checklist does not belong to shift"));
            }
            if (!venueAccessService.taskBelongsToChecklist(taskId, checklistId)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("INVALID_REQUEST", "Task does not belong to checklist"));
            }

            TaskItem task = checklistService.skipTask(taskId);
            checklistService.updateChecklistCompletion(checklistId);
            return ResponseEntity.ok(ApiResponse.success(toTaskResponse(task)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    private ChecklistResponse toChecklistResponse(Checklist checklist) {
        return new ChecklistResponse(
                checklist.getId(),
                checklist.getShiftId(),
                checklist.getCategory(),
                checklist.getTitle(),
                checklist.getIsCompleted(),
                checklist.getCompletionPercentage(),
                checklist.getCreatedAt());
    }

    private ChecklistDetailResponse toChecklistDetailResponse(Checklist checklist) {
        List<TaskResponse> tasks = checklist.getTasks().stream()
                .map(this::toTaskResponse)
                .toList();
        return new ChecklistDetailResponse(
                checklist.getId(),
                checklist.getShiftId(),
                checklist.getCategory(),
                checklist.getTitle(),
                checklist.getIsCompleted(),
                checklist.getCompletionPercentage(),
                checklist.getCreatedAt(),
                tasks);
    }

    private TaskResponse toTaskResponse(TaskItem task) {
        return new TaskResponse(
                task.getId(),
                task.getDescription(),
                task.getStatus(),
                task.getSortOrder(),
                task.getRequiresPhoto(),
                task.getCompletedAt(),
                task.getCompletedByUserId());
    }

    // DTOs
    public record CreateChecklistRequest(
            @NotNull ChecklistCategory category,
            @NotBlank String title) {
    }

    public record CreateTaskRequest(
            @NotBlank String description,
            @NotNull Integer sortOrder,
            boolean requiresPhoto) {
    }

    public record ChecklistResponse(
            Long id,
            Long shiftId,
            ChecklistCategory category,
            String title,
            boolean isCompleted,
            double completionPercentage,
            Instant createdAt) {
    }

    public record ChecklistDetailResponse(
            Long id,
            Long shiftId,
            ChecklistCategory category,
            String title,
            boolean isCompleted,
            double completionPercentage,
            Instant createdAt,
            List<TaskResponse> tasks) {
    }

    public record TaskResponse(
            Long id,
            String description,
            TaskStatus status,
            int sortOrder,
            boolean requiresPhoto,
            Instant completedAt,
            Long completedByUserId) {
    }
}
