package de.kesselops.inventory.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Represents a menu item (what you SELL to customers).
 * Each MenuItem can have one Recipe that defines how to make it.
 */
@Entity
@Table(name = "menu_items", indexes = {
        @Index(name = "idx_menu_items_venue", columnList = "venue_id"),
        @Index(name = "idx_menu_items_category", columnList = "category")
})
public class MenuItem extends BaseEntity {

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Category is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MenuCategory category;

    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @PositiveOrZero(message = "Cost must be zero or positive")
    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @NotNull(message = "Venue ID is required")
    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private boolean available = true;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @OneToOne(mappedBy = "menuItem", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Recipe recipe;

    // Getters and Setters
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

    public Recipe getRecipe() {
        return recipe;
    }

    public void setRecipe(Recipe recipe) {
        this.recipe = recipe;
    }

    /**
     * Calculate profit margin percentage.
     * Formula: ((price - cost) / price) * 100
     */
    public BigDecimal getProfitMargin() {
        if (price == null || price.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal actualCost = (cost != null) ? cost : BigDecimal.ZERO;
        return price.subtract(actualCost)
                .divide(price, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }
}
