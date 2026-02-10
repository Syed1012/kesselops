package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.DifficultyLevel;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating or updating a recipe.
 */
public class RecipeRequest {

    @NotNull(message = "Menu item ID is required")
    private Long menuItemId;

    private String instructions;

    private Integer prepTimeMinutes;

    private DifficultyLevel difficulty;

    private String notes;

    // Getters and Setters
    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
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
}
