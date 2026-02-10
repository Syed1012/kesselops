package de.kesselops.menu.repository;

import de.kesselops.menu.model.Menu;
import de.kesselops.menu.model.MenuType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Menu entity.
 */
@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {

    /**
     * Find all active menus for a venue ordered by display order.
     */
    List<Menu> findByVenueIdAndActiveTrueOrderByDisplayOrderAsc(Long venueId);

    /**
     * Find menus by type for a venue.
     */
    List<Menu> findByVenueIdAndTypeAndActiveTrue(Long venueId, MenuType type);

    /**
     * Find menu with items eagerly loaded.
     */
    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.menuItems WHERE m.id = :id")
    Optional<Menu> findByIdWithItems(@Param("id") Long id);

    /**
     * Find menu with syndications eagerly loaded.
     */
    @Query("SELECT m FROM Menu m LEFT JOIN FETCH m.syndications WHERE m.id = :id")
    Optional<Menu> findByIdWithSyndications(@Param("id") Long id);

    /**
     * Find menu with items and syndications.
     */
    @Query("SELECT DISTINCT m FROM Menu m LEFT JOIN FETCH m.menuItems LEFT JOIN FETCH m.syndications WHERE m.id = :id")
    Optional<Menu> findByIdWithItemsAndSyndications(@Param("id") Long id);
}
