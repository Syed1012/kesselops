package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Recipe entity.
 */
@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {

    /**
     * Find recipe by menu item ID.
     */
    Optional<Recipe> findByMenuItemId(Long menuItemId);

    /**
     * Check if a recipe exists for a menu item.
     */
    boolean existsByMenuItemId(Long menuItemId);

    /**
     * Find recipe with ingredients eagerly loaded.
     */
    @Query("SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients WHERE r.id = :id")
    Optional<Recipe> findByIdWithIngredients(@Param("id") Long id);

    /**
     * Find recipe by menu item ID with ingredients.
     */
    @Query("SELECT r FROM Recipe r LEFT JOIN FETCH r.ingredients WHERE r.menuItem.id = :menuItemId")
    Optional<Recipe> findByMenuItemIdWithIngredients(@Param("menuItemId") Long menuItemId);
}
