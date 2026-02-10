package de.kesselops.inventory.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/**
 * Represents an ingredient in a recipe.
 * Links Recipe to InventoryItem with quantity information.
 */
@Entity
@Table(name = "recipe_ingredients", indexes = {
        @Index(name = "idx_recipe_ingredients_recipe", columnList = "recipe_id"),
        @Index(name = "idx_recipe_ingredients_item", columnList = "inventory_item_id")
})
public class RecipeIngredient extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal quantity;

    @Column(length = 30)
    private String unit;

    @Column(length = 500)
    private String notes;

    // Getters and Setters
    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    public InventoryItem getInventoryItem() {
        return inventoryItem;
    }

    public void setInventoryItem(InventoryItem inventoryItem) {
        this.inventoryItem = inventoryItem;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    /**
     * Calculate the cost of this ingredient based on inventory item cost.
     */
    public BigDecimal getCost() {
        if (inventoryItem == null || inventoryItem.getUnitCost() == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return inventoryItem.getUnitCost().multiply(quantity);
    }
}
