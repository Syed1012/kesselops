package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.RecipeIngredient;

import java.math.BigDecimal;

/**
 * Response DTO for recipe ingredient data.
 */
public class RecipeIngredientResponse {

    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private String inventoryItemUnit;
    private BigDecimal quantity;
    private String unit;
    private String notes;
    private BigDecimal cost;

    public static RecipeIngredientResponse fromEntity(RecipeIngredient entity) {
        RecipeIngredientResponse response = new RecipeIngredientResponse();
        response.id = entity.getId();
        response.inventoryItemId = entity.getInventoryItem().getId();
        response.inventoryItemName = entity.getInventoryItem().getName();
        response.inventoryItemUnit = entity.getInventoryItem().getUnit();
        response.quantity = entity.getQuantity();
        response.unit = entity.getUnit();
        response.notes = entity.getNotes();
        response.cost = entity.getCost();
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInventoryItemId() {
        return inventoryItemId;
    }

    public void setInventoryItemId(Long inventoryItemId) {
        this.inventoryItemId = inventoryItemId;
    }

    public String getInventoryItemName() {
        return inventoryItemName;
    }

    public void setInventoryItemName(String inventoryItemName) {
        this.inventoryItemName = inventoryItemName;
    }

    public String getInventoryItemUnit() {
        return inventoryItemUnit;
    }

    public void setInventoryItemUnit(String inventoryItemUnit) {
        this.inventoryItemUnit = inventoryItemUnit;
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

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }
}
