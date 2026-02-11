package de.kesselops.operations.service;

import de.kesselops.operations.model.LearningProgress;
import de.kesselops.operations.model.User;
import de.kesselops.operations.repository.LearningProgressRepository;
import de.kesselops.operations.repository.UserRepository;
import de.kesselops.shared.model.Role;
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
    private final UserRepository userRepository;
    private final VenueAccessService venueAccessService;

    public LearningProgressService(LearningProgressRepository learningProgressRepository,
                                   UserRepository userRepository,
                                   VenueAccessService venueAccessService) {
        this.learningProgressRepository = learningProgressRepository;
        this.userRepository = userRepository;
        this.venueAccessService = venueAccessService;
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

    /**
     * Get trainee learning progress for a venue (manager analytics).
     */
    public List<TraineeProgressRow> getVenueTraineeProgress(User currentUser, Long venueId) {
        Long effectiveVenueId = resolveEffectiveVenueId(currentUser, venueId);
        List<User> trainees = userRepository.findByVenueIdAndRole(effectiveVenueId, Role.TRAINEE);
        if (trainees.isEmpty()) {
            return List.of();
        }

        List<Long> traineeIds = trainees.stream().map(User::getId).toList();
        List<LearningProgress> rows = learningProgressRepository.findByUserIdInOrderByUserIdAscModuleIdAscCompletedAtAsc(traineeIds);

        Map<Long, Map<String, LinkedHashSet<String>>> progressByUser = new HashMap<>();
        Map<Long, Instant> lastCompletedByUser = new HashMap<>();

        for (LearningProgress row : rows) {
            progressByUser
                    .computeIfAbsent(row.getUserId(), ignored -> new LinkedHashMap<>())
                    .computeIfAbsent(row.getModuleId(), ignored -> new LinkedHashSet<>())
                    .add(row.getChapterId());

            Instant currentLatest = lastCompletedByUser.get(row.getUserId());
            if (currentLatest == null || row.getCompletedAt().isAfter(currentLatest)) {
                lastCompletedByUser.put(row.getUserId(), row.getCompletedAt());
            }
        }

        return trainees.stream()
                .map(trainee -> {
                    Map<String, List<String>> completedByModule = new LinkedHashMap<>();
                    Map<String, LinkedHashSet<String>> moduleMap = progressByUser.getOrDefault(trainee.getId(), Map.of());
                    moduleMap.forEach((moduleId, chapterIds) -> completedByModule.put(moduleId, new ArrayList<>(chapterIds)));

                    return new TraineeProgressRow(
                            trainee.getId(),
                            trainee.getFirstName(),
                            trainee.getLastName(),
                            trainee.getEmail(),
                            trainee.getRole(),
                            completedByModule,
                            lastCompletedByUser.get(trainee.getId())
                    );
                })
                .toList();
    }

    private Long resolveEffectiveVenueId(User currentUser, Long requestedVenueId) {
        if (currentUser.getRole() == Role.OWNER) {
            if (requestedVenueId == null) {
                throw new IllegalArgumentException("Venue ID is required");
            }
            if (!venueAccessService.canAccessVenue(currentUser, requestedVenueId)) {
                throw new IllegalArgumentException("Access denied to venue");
            }
            return requestedVenueId;
        }

        Long userVenueId = currentUser.getVenueId();
        if (userVenueId == null) {
            throw new IllegalArgumentException("No venue assigned");
        }
        if (!venueAccessService.canAccessVenue(currentUser, userVenueId)) {
            throw new IllegalArgumentException("Access denied to venue");
        }
        return userVenueId;
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

    public record TraineeProgressRow(
            Long userId,
            String firstName,
            String lastName,
            String email,
            Role role,
            Map<String, List<String>> completedByModule,
            Instant lastCompletedAt
    ) {}
}
