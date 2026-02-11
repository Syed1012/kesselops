package de.kesselops.operations.model;

import jakarta.persistence.*;

import java.time.Instant;

/**
 * Per-user lesson completion record for Learn modules.
 */
@Entity
@Table(
        name = "learning_progress",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_learning_progress_user_module_chapter",
                columnNames = {"user_id", "module_id", "chapter_id"}
        )
)
public class LearningProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "module_id", nullable = false, length = 100)
    private String moduleId;

    @Column(name = "chapter_id", nullable = false, length = 100)
    private String chapterId;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @PrePersist
    protected void onCreate() {
        if (completedAt == null) {
            completedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getModuleId() {
        return moduleId;
    }

    public void setModuleId(String moduleId) {
        this.moduleId = moduleId;
    }

    public String getChapterId() {
        return chapterId;
    }

    public void setChapterId(String chapterId) {
        this.chapterId = chapterId;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
