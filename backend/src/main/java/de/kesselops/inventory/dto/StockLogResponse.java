package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.StockLog;
import de.kesselops.inventory.model.StockLogType;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Response DTO for stock log data.
 */
public class StockLogResponse {

    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private StockLogType type;
    private BigDecimal quantity;
    private BigDecimal quantityBefore;
    private BigDecimal quantityAfter;
    private String reason;
    private String referenceType;
    private Long referenceId;
    private Long performedBy;
    private Instant createdAt;

    public static StockLogResponse fromEntity(StockLog entity) {
        StockLogResponse response = new StockLogResponse();
        response.id = entity.getId();
        response.inventoryItemId = entity.getInventoryItem().getId();
        response.inventoryItemName = entity.getInventoryItem().getName();
        response.type = entity.getType();
        response.quantity = entity.getQuantity();
        response.quantityBefore = entity.getQuantityBefore();
        response.quantityAfter = entity.getQuantityAfter();
        response.reason = entity.getReason();
        response.referenceType = entity.getReferenceType();
        response.referenceId = entity.getReferenceId();
        response.performedBy = entity.getPerformedBy();
        response.createdAt = entity.getCreatedAt();
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

    public StockLogType getType() {
        return type;
    }

    public void setType(StockLogType type) {
        this.type = type;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getQuantityBefore() {
        return quantityBefore;
    }

    public void setQuantityBefore(BigDecimal quantityBefore) {
        this.quantityBefore = quantityBefore;
    }

    public BigDecimal getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(BigDecimal quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public Long getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(Long performedBy) {
        this.performedBy = performedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
