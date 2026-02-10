package de.kesselops.inventory.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;

/**
 * Represents an inventory item (what you STOCK).
 * Tracks stock levels, reorder thresholds, and supplier relationships.
 */
@Entity
@Table(name = "inventory_items", indexes = {
        @Index(name = "idx_inventory_items_venue", columnList = "venue_id"),
        @Index(name = "idx_inventory_items_sku", columnList = "sku"),
        @Index(name = "idx_inventory_items_supplier", columnList = "supplier_id")
})
public class InventoryItem extends BaseEntity {

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "SKU is required")
    @Column(nullable = false, length = 50)
    private String sku;

    @Column(length = 500)
    private String description;

    @NotBlank(message = "Unit is required")
    @Column(nullable = false, length = 30)
    private String unit;

    @NotNull(message = "Quantity on hand is required")
    @PositiveOrZero(message = "Quantity must be zero or positive")
    @Column(name = "quantity_on_hand", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @PositiveOrZero(message = "Reorder level must be zero or positive")
    @Column(name = "reorder_level", precision = 10, scale = 2)
    private BigDecimal reorderLevel = BigDecimal.ZERO;

    @PositiveOrZero(message = "Reorder quantity must be zero or positive")
    @Column(name = "reorder_quantity", precision = 10, scale = 2)
    private BigDecimal reorderQuantity = BigDecimal.ZERO;

    @PositiveOrZero(message = "Unit cost must be zero or positive")
    @Column(name = "unit_cost", precision = 10, scale = 2)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @NotNull(message = "Venue ID is required")
    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(BigDecimal quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(BigDecimal reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public BigDecimal getReorderQuantity() {
        return reorderQuantity;
    }

    public void setReorderQuantity(BigDecimal reorderQuantity) {
        this.reorderQuantity = reorderQuantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Check if the inventory item is below reorder level.
     */
    public boolean isLowStock() {
        return quantityOnHand.compareTo(reorderLevel) <= 0;
    }
}
