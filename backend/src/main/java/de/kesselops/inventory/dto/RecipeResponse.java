package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.DifficultyLevel;
import de.kesselops.inventory.model.Recipe;
import de.kesselops.inventory.model.RecipeIngredient;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Response DTO for recipe data with ingredients.
 */
public class RecipeResponse {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private String instructions;
    private Integer prepTimeMinutes;
    private DifficultyLevel difficulty;
    private String notes;
    private BigDecimal totalCost;
    private List<RecipeIngredientResponse> ingredients;
    private Instant createdAt;
    private Instant updatedAt;

    public static RecipeResponse fromEntity(Recipe entity) {
        RecipeResponse response = new RecipeResponse();
        response.id = entity.getId();
        response.menuItemId = entity.getMenuItem().getId();
        response.menuItemName = entity.getMenuItem().getName();
        response.instructions = entity.getInstructions();
        response.prepTimeMinutes = entity.getPrepTimeMinutes();
        response.difficulty = entity.getDifficulty();
        response.notes = entity.getNotes();
        response.createdAt = entity.getCreatedAt();
        response.updatedAt = entity.getUpdatedAt();

        // Calculate total cost and map ingredients
        response.ingredients = entity.getIngredients().stream()
                .map(RecipeIngredientResponse::fromEntity)
                .toList();

        response.totalCost = entity.getIngredients().stream()
                .map(RecipeIngredient::getCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getMenuItemName() {
        return menuItemName;
    }

    public void setMenuItemName(String menuItemName) {
        this.menuItemName = menuItemName;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Integer getPrepTimeMinutes() {
        return prepTimeMinutes;
    }

    public void setPrepTimeMinutes(Integer prepTimeMinutes) {
        this.prepTimeMinutes = prepTimeMinutes;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public List<RecipeIngredientResponse> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<RecipeIngredientResponse> ingredients) {
        this.ingredients = ingredients;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
