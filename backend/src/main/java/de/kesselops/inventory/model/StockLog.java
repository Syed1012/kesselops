package de.kesselops.inventory.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Immutable audit log for stock movements.
 * Records all changes to inventory quantities.
 */
@Entity
@Table(name = "stock_logs", indexes = {
        @Index(name = "idx_stock_logs_item", columnList = "inventory_item_id"),
        @Index(name = "idx_stock_logs_type", columnList = "type"),
        @Index(name = "idx_stock_logs_created", columnList = "created_at")
})
public class StockLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem inventoryItem;

    @NotNull(message = "Type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockLogType type;

    @NotNull(message = "Quantity is required")
    @Column(nullable = false, precision = 10, scale = 4)
    private BigDecimal quantity;

    @Column(name = "quantity_before", precision = 10, scale = 4)
    private BigDecimal quantityBefore;

    @Column(name = "quantity_after", precision = 10, scale = 4)
    private BigDecimal quantityAfter;

    @Column(length = 500)
    private String reason;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "performed_by")
    private Long performedBy;

    // Getters and Setters
    public InventoryItem getInventoryItem() {
        return inventoryItem;
    }

    public void setInventoryItem(InventoryItem inventoryItem) {
        this.inventoryItem = inventoryItem;
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
}
