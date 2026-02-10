package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.MenuCategory;
import de.kesselops.inventory.model.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for MenuItem entity.
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /**
     * Find all active menu items for a venue.
     */
    Page<MenuItem> findByVenueIdAndActiveTrue(Long venueId, Pageable pageable);

    /**
     * Find by category for a venue.
     */
    Page<MenuItem> findByVenueIdAndCategoryAndActiveTrue(Long venueId, MenuCategory category, Pageable pageable);

    /**
     * Find available items for a venue.
     */
    List<MenuItem> findByVenueIdAndActiveTrueAndAvailableTrue(Long venueId);

    /**
     * Search by name.
     */
    @Query("SELECT m FROM MenuItem m WHERE m.venueId = :venueId AND m.active = true AND LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<MenuItem> searchByVenueId(@Param("venueId") Long venueId, @Param("search") String search, Pageable pageable);

    /**
     * Count items by category for a venue.
     */
    long countByVenueIdAndCategoryAndActiveTrue(Long venueId, MenuCategory category);
}
