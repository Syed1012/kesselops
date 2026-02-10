package de.kesselops.inventory.dto;

import de.kesselops.inventory.model.PurchaseOrder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Response DTO for purchase order.
 */
public class PurchaseOrderResponse {

    private Long id;
    private Long venueId;
    private Long supplierId;
    private String supplierName;
    private PurchaseOrder.Status status;
    private String notes;
    private BigDecimal totalAmount;
    private List<PurchaseOrderLineResponse> lines;
    private Instant createdAt;
    private Instant updatedAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public PurchaseOrder.Status getStatus() {
        return status;
    }

    public void setStatus(PurchaseOrder.Status status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<PurchaseOrderLineResponse> getLines() {
        return lines;
    }

    public void setLines(List<PurchaseOrderLineResponse> lines) {
        this.lines = lines;
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
