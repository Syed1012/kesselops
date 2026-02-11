package de.kesselops.operations.controller;

import de.kesselops.operations.model.User;
import de.kesselops.operations.service.LearningProgressService;
import de.kesselops.shared.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST endpoints for Learn module progress persistence.
 */
@RestController
@RequestMapping("/api/learning/progress")
public class LearningProgressController {

    private final LearningProgressService learningProgressService;

    public LearningProgressController(LearningProgressService learningProgressService) {
        this.learningProgressService = learningProgressService;
    }

    /**
     * Get all module progress for the current user.
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, List<String>>>> getProgress(
            @AuthenticationPrincipal User currentUser
    ) {
        Map<String, List<String>> progress = learningProgressService.getProgressByUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    /**
     * Replace one module's completed chapter IDs for the current user.
     */
    @PutMapping("/{moduleId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<String>>> updateModuleProgress(
            @AuthenticationPrincipal User currentUser,
            @PathVariable String moduleId,
            @RequestBody UpdateModuleProgressRequest request
    ) {
        try {
            List<String> saved = learningProgressService.setModuleProgress(
                    currentUser.getId(),
                    moduleId,
                    request.completedChapterIds()
            );
            return ResponseEntity.ok(ApiResponse.success(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    /**
     * Get trainee learning progress for manager analytics.
     */
    @GetMapping("/trainees")
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'CHEF')")
    public ResponseEntity<ApiResponse<List<LearningProgressService.TraineeProgressRow>>> getTraineeProgress(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Long venueId
    ) {
        try {
            List<LearningProgressService.TraineeProgressRow> rows =
                    learningProgressService.getVenueTraineeProgress(currentUser, venueId);
            return ResponseEntity.ok(ApiResponse.success(rows));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_REQUEST", e.getMessage()));
        }
    }

    public record UpdateModuleProgressRequest(List<String> completedChapterIds) {}
}
