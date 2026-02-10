package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.InventoryItem;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for inventory item data.
 */
public class InventoryItemResponse {

    private Long id;
    private String name;
    private String sku;
    private String description;
    private String unit;
    private BigDecimal quantityOnHand;
    private BigDecimal reorderLevel;
    private BigDecimal reorderQuantity;
    private BigDecimal unitCost;
    private Long venueId;
    private Long supplierId;
    private String supplierName;
    private boolean active;
    private boolean lowStock;
    private Instant createdAt;
    private Instant updatedAt;

    public static InventoryItemResponse fromEntity(InventoryItem entity) {
        InventoryItemResponse response = new InventoryItemResponse();
        response.id = entity.getId();
        response.name = entity.getName();
        response.sku = entity.getSku();
        response.description = entity.getDescription();
        response.unit = entity.getUnit();
        response.quantityOnHand = entity.getQuantityOnHand();
        response.reorderLevel = entity.getReorderLevel();
        response.reorderQuantity = entity.getReorderQuantity();
        response.unitCost = entity.getUnitCost();
        response.venueId = entity.getVenueId();
        response.active = entity.isActive();
        response.lowStock = entity.isLowStock();
        response.createdAt = entity.getCreatedAt();
        response.updatedAt = entity.getUpdatedAt();

        if (entity.getSupplier() != null) {
            response.supplierId = entity.getSupplier().getId();
            response.supplierName = entity.getSupplier().getName();
        }

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

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public void setLowStock(boolean lowStock) {
        this.lowStock = lowStock;
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
