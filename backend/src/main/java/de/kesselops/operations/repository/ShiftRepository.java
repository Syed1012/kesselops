package de.kesselops.operations.repository;

import de.kesselops.operations.model.Shift;
import de.kesselops.operations.model.ShiftType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Shift entity operations.
 */
@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {

    Page<Shift> findByVenueId(Long venueId, Pageable pageable);

    @Query("SELECT s FROM Shift s WHERE s.venueId = :venueId AND s.startTime >= :from AND s.endTime <= :to")
    Page<Shift> findByVenueIdAndDateRange(
            @Param("venueId") Long venueId,
            @Param("from") Instant from,
            @Param("to") Instant to,
            Pageable pageable
    );

    Optional<Shift> findByVenueIdAndIsActiveTrue(Long venueId);

    @Query("SELECT s FROM Shift s WHERE s.venueId = :venueId AND s.type = :type AND " +
            "((s.startTime <= :endTime AND s.endTime >= :startTime))")
    List<Shift> findOverlappingShifts(
            @Param("venueId") Long venueId,
            @Param("type") ShiftType type,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );
}
