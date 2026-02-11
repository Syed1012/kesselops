package de.kesselops.operations.repository;

import de.kesselops.operations.model.User;
import de.kesselops.shared.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

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

    List<User> findByVenueIdAndRole(Long venueId, Role role);

    boolean existsByIdAndVenueId(Long id, Long venueId);

    @Query("""
            SELECT DISTINCT u
            FROM User u
            WHERE u.venueId = :venueId
               OR u.id = (
                    SELECT v.ownerId
                    FROM Venue v
                    WHERE v.id = :venueId
               )
            """)
    List<User> findTeamUsersByVenueId(@Param("venueId") Long venueId);
}
