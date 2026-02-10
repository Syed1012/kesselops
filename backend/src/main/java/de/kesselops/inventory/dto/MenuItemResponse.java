package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.MenuCategory;
import de.kesselops.inventory.model.MenuItem;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for menu item data.
 */
public class MenuItemResponse {

    private Long id;
    private String name;
    private String description;
    private MenuCategory category;
    private BigDecimal price;
    private BigDecimal cost;
    private BigDecimal profitMargin;
    private Long venueId;
    private boolean available;
    private boolean active;
    private boolean hasRecipe;
    private Instant createdAt;
    private Instant updatedAt;

    public static MenuItemResponse fromEntity(MenuItem entity) {
        MenuItemResponse response = new MenuItemResponse();
        response.id = entity.getId();
        response.name = entity.getName();
        response.description = entity.getDescription();
        response.category = entity.getCategory();
        response.price = entity.getPrice();
        response.cost = entity.getCost();
        response.profitMargin = entity.getProfitMargin();
        response.venueId = entity.getVenueId();
        response.available = entity.isAvailable();
        response.active = entity.isActive();
        response.hasRecipe = entity.getRecipe() != null;
        response.createdAt = entity.getCreatedAt();
        response.updatedAt = entity.getUpdatedAt();
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MenuCategory getCategory() {
        return category;
    }

    public void setCategory(MenuCategory category) {
        this.category = category;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public BigDecimal getProfitMargin() {
        return profitMargin;
    }

    public void setProfitMargin(BigDecimal profitMargin) {
        this.profitMargin = profitMargin;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isHasRecipe() {
        return hasRecipe;
    }

    public void setHasRecipe(boolean hasRecipe) {
        this.hasRecipe = hasRecipe;
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
