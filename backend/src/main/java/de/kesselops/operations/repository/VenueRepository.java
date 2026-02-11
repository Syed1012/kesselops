package de.kesselops.operations.repository;

import de.kesselops.operations.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Venue entity operations.
 */
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    List<Venue> findByOwnerId(Long ownerId);

    Optional<Venue> findByIdAndOwnerId(Long id, Long ownerId);

    boolean existsByIdAndOwnerId(Long id, Long ownerId);
}
