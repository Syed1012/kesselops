package de.kesselops.operations.repository;

import de.kesselops.operations.model.Checklist;
import de.kesselops.operations.model.ChecklistCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Checklist entity operations.
 */
@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {

    List<Checklist> findByShiftId(Long shiftId);

    List<Checklist> findByShiftIdAndCategory(Long shiftId, ChecklistCategory category);
}
