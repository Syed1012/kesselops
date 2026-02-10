package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.RecipeIngredientRequest;
import de.kesselops.inventory.dto.RecipeRequest;
import de.kesselops.inventory.dto.RecipeResponse;
import de.kesselops.inventory.service.RecipeService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Recipe operations.
 */
@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RecipeResponse>> create(
            @Valid @RequestBody RecipeRequest request) {
        RecipeResponse response = recipeService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Recipe created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponse>> getById(@PathVariable Long id) {
        RecipeResponse response = recipeService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/by-menu-item/{menuItemId}")
    public ResponseEntity<ApiResponse<RecipeResponse>> getByMenuItemId(
            @PathVariable Long menuItemId) {
        RecipeResponse response = recipeService.getByMenuItemId(menuItemId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RecipeResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequest request) {
        RecipeResponse response = recipeService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Recipe updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        recipeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Recipe deleted"));
    }

    @PostMapping("/{id}/ingredients")
    public ResponseEntity<ApiResponse<RecipeResponse>> addIngredient(
            @PathVariable Long id,
            @Valid @RequestBody RecipeIngredientRequest request) {
        RecipeResponse response = recipeService.addIngredient(id, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Ingredient added"));
    }

    @PutMapping("/{id}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<RecipeResponse>> updateIngredient(
            @PathVariable Long id,
            @PathVariable Long ingredientId,
            @Valid @RequestBody RecipeIngredientRequest request) {
        RecipeResponse response = recipeService.updateIngredient(id, ingredientId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Ingredient updated"));
    }

    @DeleteMapping("/{id}/ingredients/{ingredientId}")
    public ResponseEntity<ApiResponse<Void>> removeIngredient(
            @PathVariable Long id,
            @PathVariable Long ingredientId) {
        recipeService.removeIngredient(id, ingredientId);
        return ResponseEntity.ok(ApiResponse.success(null, "Ingredient removed"));
    }

    @PostMapping("/recalculate-cost/{menuItemId}")
    public ResponseEntity<ApiResponse<Void>> recalculateCost(@PathVariable Long menuItemId) {
        recipeService.recalculateCost(menuItemId);
        return ResponseEntity.ok(ApiResponse.success(null, "Cost recalculated"));
    }
}
