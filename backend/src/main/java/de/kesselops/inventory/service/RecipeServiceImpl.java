package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.RecipeIngredientRequest;
import de.kesselops.inventory.dto.RecipeRequest;
import de.kesselops.inventory.dto.RecipeResponse;
import de.kesselops.inventory.model.*;
import de.kesselops.inventory.repository.*;
import de.kesselops.shared.exception.BusinessRuleException;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Implementation of RecipeService.
 */
@Service
@Transactional
public class RecipeServiceImpl implements RecipeService {

    private final RecipeRepository recipeRepository;
    private final MenuItemRepository menuItemRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final RecipeIngredientRepository recipeIngredientRepository;

    public RecipeServiceImpl(RecipeRepository recipeRepository,
            MenuItemRepository menuItemRepository,
            InventoryItemRepository inventoryItemRepository,
            RecipeIngredientRepository recipeIngredientRepository) {
        this.recipeRepository = recipeRepository;
        this.menuItemRepository = menuItemRepository;
        this.inventoryItemRepository = inventoryItemRepository;
        this.recipeIngredientRepository = recipeIngredientRepository;
    }

    @Override
    public RecipeResponse create(RecipeRequest request) {
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", request.getMenuItemId()));

        if (recipeRepository.existsByMenuItemId(request.getMenuItemId())) {
            throw new BusinessRuleException("CONFLICT", "Recipe already exists for this menu item");
        }

        Recipe recipe = new Recipe();
        recipe.setMenuItem(menuItem);
        mapRequestToEntity(request, recipe);

        Recipe saved = recipeRepository.save(recipe);
        return RecipeResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse getById(Long id) {
        Recipe recipe = recipeRepository.findByIdWithIngredients(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));
        return RecipeResponse.fromEntity(recipe);
    }

    @Override
    @Transactional(readOnly = true)
    public RecipeResponse getByMenuItemId(Long menuItemId) {
        Recipe recipe = recipeRepository.findByMenuItemIdWithIngredients(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe for MenuItem", menuItemId));
        return RecipeResponse.fromEntity(recipe);
    }

    @Override
    public RecipeResponse update(Long id, RecipeRequest request) {
        Recipe recipe = findByIdOrThrow(id);
        mapRequestToEntity(request, recipe);
        Recipe saved = recipeRepository.save(recipe);
        return RecipeResponse.fromEntity(saved);
    }

    @Override
    public void delete(Long id) {
        Recipe recipe = findByIdOrThrow(id);
        recipeRepository.delete(recipe);
    }

    @Override
    public RecipeResponse addIngredient(Long recipeId, RecipeIngredientRequest request) {
        Recipe recipe = findByIdOrThrow(recipeId);
        InventoryItem inventoryItem = inventoryItemRepository.findById(request.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", request.getInventoryItemId()));

        RecipeIngredient ingredient = new RecipeIngredient();
        ingredient.setInventoryItem(inventoryItem);
        ingredient.setQuantity(request.getQuantity());
        ingredient.setUnit(request.getUnit() != null ? request.getUnit() : inventoryItem.getUnit());
        ingredient.setNotes(request.getNotes());

        recipe.addIngredient(ingredient);
        Recipe saved = recipeRepository.save(recipe);

        // Update menu item cost
        updateMenuItemCost(recipe.getMenuItem());

        return RecipeResponse.fromEntity(saved);
    }

    @Override
    public RecipeResponse updateIngredient(Long recipeId, Long ingredientId, RecipeIngredientRequest request) {
        Recipe recipe = findByIdOrThrow(recipeId);
        RecipeIngredient ingredient = recipeIngredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeIngredient", ingredientId));

        if (!ingredient.getRecipe().getId().equals(recipeId)) {
            throw new BusinessRuleException("INVALID", "Ingredient does not belong to this recipe");
        }

        if (!ingredient.getInventoryItem().getId().equals(request.getInventoryItemId())) {
            InventoryItem newItem = inventoryItemRepository.findById(request.getInventoryItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", request.getInventoryItemId()));
            ingredient.setInventoryItem(newItem);
        }

        ingredient.setQuantity(request.getQuantity());
        if (request.getUnit() != null) {
            ingredient.setUnit(request.getUnit());
        }
        ingredient.setNotes(request.getNotes());

        recipeIngredientRepository.save(ingredient);
        updateMenuItemCost(recipe.getMenuItem());

        return RecipeResponse.fromEntity(recipe);
    }

    @Override
    public void removeIngredient(Long recipeId, Long ingredientId) {
        Recipe recipe = findByIdOrThrow(recipeId);
        RecipeIngredient ingredient = recipeIngredientRepository.findById(ingredientId)
                .orElseThrow(() -> new ResourceNotFoundException("RecipeIngredient", ingredientId));

        if (!ingredient.getRecipe().getId().equals(recipeId)) {
            throw new BusinessRuleException("INVALID", "Ingredient does not belong to this recipe");
        }

        recipe.removeIngredient(ingredient);
        recipeIngredientRepository.delete(ingredient);
        updateMenuItemCost(recipe.getMenuItem());
    }

    @Override
    public void recalculateCost(Long menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", menuItemId));
        updateMenuItemCost(menuItem);
    }

    private Recipe findByIdOrThrow(Long id) {
        return recipeRepository.findByIdWithIngredients(id)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe", id));
    }

    private void mapRequestToEntity(RecipeRequest request, Recipe recipe) {
        recipe.setInstructions(request.getInstructions());
        recipe.setPrepTimeMinutes(request.getPrepTimeMinutes());
        if (request.getDifficulty() != null) {
            recipe.setDifficulty(request.getDifficulty());
        }
        recipe.setNotes(request.getNotes());
    }

    private void updateMenuItemCost(MenuItem menuItem) {
        Recipe recipe = recipeRepository.findByMenuItemIdWithIngredients(menuItem.getId()).orElse(null);
        if (recipe == null) {
            menuItem.setCost(BigDecimal.ZERO);
        } else {
            BigDecimal totalCost = recipe.getIngredients().stream()
                    .map(RecipeIngredient::getCost)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            menuItem.setCost(totalCost);
        }
        menuItemRepository.save(menuItem);
    }
}
