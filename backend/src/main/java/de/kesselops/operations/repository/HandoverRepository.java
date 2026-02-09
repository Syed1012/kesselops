package de.kesselops.operations.repository;

import de.kesselops.operations.model.Handover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Handover entity operations.
 */
@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {

    Optional<Handover> findByFromShiftId(Long fromShiftId);

    Optional<Handover> findByToShiftId(Long toShiftId);
}
