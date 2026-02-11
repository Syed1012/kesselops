package de.kesselops.operations.repository;

import de.kesselops.operations.model.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for user learning progress.
 */
@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {

    List<LearningProgress> findByUserIdOrderByModuleIdAscCompletedAtAsc(Long userId);

    List<LearningProgress> findByUserIdAndModuleId(Long userId, String moduleId);

    List<LearningProgress> findByUserIdInOrderByUserIdAscModuleIdAscCompletedAtAsc(List<Long> userIds);

    void deleteByUserIdAndModuleIdAndChapterIdIn(Long userId, String moduleId, List<String> chapterIds);
}
