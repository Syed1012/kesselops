package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.RecipeIngredientRequest;
import de.kesselops.inventory.dto.RecipeRequest;
import de.kesselops.inventory.dto.RecipeResponse;

/**
 * Service interface for Recipe operations.
 */
public interface RecipeService {

    RecipeResponse create(RecipeRequest request);

    RecipeResponse getById(Long id);

    RecipeResponse getByMenuItemId(Long menuItemId);

    RecipeResponse update(Long id, RecipeRequest request);

    void delete(Long id);

    RecipeResponse addIngredient(Long recipeId, RecipeIngredientRequest request);

    RecipeResponse updateIngredient(Long recipeId, Long ingredientId, RecipeIngredientRequest request);

    void removeIngredient(Long recipeId, Long ingredientId);

    /**
     * Recalculate the cost of a menu item based on its recipe ingredients.
     */
    void recalculateCost(Long menuItemId);
}
