package de.kesselops.operations.service;

import de.kesselops.operations.model.LearningProgress;
import de.kesselops.operations.repository.LearningProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Service for persisting and reading Learn module completion state.
 */
@Service
public class LearningProgressService {

    private final LearningProgressRepository learningProgressRepository;

    public LearningProgressService(LearningProgressRepository learningProgressRepository) {
        this.learningProgressRepository = learningProgressRepository;
    }

    /**
     * Get all completed chapter IDs grouped by module for the given user.
     */
    public Map<String, List<String>> getProgressByUser(Long userId) {
        List<LearningProgress> rows = learningProgressRepository.findByUserIdOrderByModuleIdAscCompletedAtAsc(userId);
        Map<String, List<String>> progress = new LinkedHashMap<>();

        for (LearningProgress row : rows) {
            progress.computeIfAbsent(row.getModuleId(), ignored -> new ArrayList<>()).add(row.getChapterId());
        }

        return progress;
    }

    /**
     * Replace module progress for a user with the provided chapter IDs.
     */
    @Transactional
    public List<String> setModuleProgress(Long userId, String moduleId, List<String> completedChapterIds) {
        String normalizedModuleId = normalizeModuleId(moduleId);
        LinkedHashSet<String> normalizedChapterIds = normalizeChapterIds(completedChapterIds);

        List<LearningProgress> existing = learningProgressRepository.findByUserIdAndModuleId(userId, normalizedModuleId);
        Set<String> existingChapterIds = existing.stream()
                .map(LearningProgress::getChapterId)
                .collect(HashSet::new, HashSet::add, HashSet::addAll);

        List<String> toDelete = existingChapterIds.stream()
                .filter(chapterId -> !normalizedChapterIds.contains(chapterId))
                .toList();

        if (!toDelete.isEmpty()) {
            learningProgressRepository.deleteByUserIdAndModuleIdAndChapterIdIn(userId, normalizedModuleId, toDelete);
        }

        List<LearningProgress> toInsert = normalizedChapterIds.stream()
                .filter(chapterId -> !existingChapterIds.contains(chapterId))
                .map(chapterId -> {
                    LearningProgress row = new LearningProgress();
                    row.setUserId(userId);
                    row.setModuleId(normalizedModuleId);
                    row.setChapterId(chapterId);
                    row.setCompletedAt(Instant.now());
                    return row;
                })
                .toList();

        if (!toInsert.isEmpty()) {
            learningProgressRepository.saveAll(toInsert);
        }

        return new ArrayList<>(normalizedChapterIds);
    }

    private String normalizeModuleId(String moduleId) {
        if (moduleId == null || moduleId.isBlank()) {
            throw new IllegalArgumentException("Module ID is required");
        }
        return moduleId.trim();
    }

    private LinkedHashSet<String> normalizeChapterIds(List<String> completedChapterIds) {
        if (completedChapterIds == null || completedChapterIds.isEmpty()) {
            return new LinkedHashSet<>();
        }

        LinkedHashSet<String> chapterIds = new LinkedHashSet<>();
        for (String chapterId : completedChapterIds) {
            if (chapterId == null) {
                continue;
            }
            String normalized = chapterId.trim();
            if (!normalized.isEmpty()) {
                chapterIds.add(normalized);
            }
        }
        return chapterIds;
    }
}
