package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for RecipeIngredient entity.
 */
@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {

    /**
     * Find all ingredients for a recipe.
     */
    List<RecipeIngredient> findByRecipeId(Long recipeId);

    /**
     * Find all recipes using an inventory item.
     */
    List<RecipeIngredient> findByInventoryItemId(Long inventoryItemId);

    /**
     * Check if an inventory item is used in any recipe.
     */
    boolean existsByInventoryItemId(Long inventoryItemId);

    /**
     * Delete all ingredients for a recipe.
     */
    void deleteByRecipeId(Long recipeId);
}
