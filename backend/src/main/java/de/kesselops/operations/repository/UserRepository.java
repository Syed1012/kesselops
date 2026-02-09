package de.kesselops.operations.repository;

import de.kesselops.operations.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity operations.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByVenueIdAndIsActiveTrue(Long venueId);

    List<User> findByVenueId(Long venueId);
}
