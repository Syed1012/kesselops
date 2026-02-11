package de.kesselops.operations.repository;

import de.kesselops.operations.model.Handover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

/**
 * Repository for Handover entity operations.
 */
@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {

    Optional<Handover> findByFromShiftId(Long fromShiftId);

    Optional<Handover> findByToShiftId(Long toShiftId);

    void deleteByAuthorUserId(Long authorUserId);

    void deleteByFromShiftIdInOrToShiftIdIn(Collection<Long> fromShiftIds, Collection<Long> toShiftIds);

    @Modifying
    @Query("UPDATE Handover h SET h.acknowledgedByUserId = null, h.acknowledgedAt = null WHERE h.acknowledgedByUserId = :userId")
    int clearAcknowledgedByUserId(@Param("userId") Long userId);
}
