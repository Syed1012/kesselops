package de.kesselops.inventory.dto;

import java.math.BigDecimal;

/**
 * Response DTO for purchase order line item.
 */
public class PurchaseOrderLineResponse {

    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private String inventoryItemSku;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal lineTotal;

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

    public String getInventoryItemSku() {
        return inventoryItemSku;
    }

    public void setInventoryItemSku(String inventoryItemSku) {
        this.inventoryItemSku = inventoryItemSku;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }
}
