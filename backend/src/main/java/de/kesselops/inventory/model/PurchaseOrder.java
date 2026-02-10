package de.kesselops.inventory.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a purchase order for restocking inventory.
 */
@Entity
@Table(name = "purchase_orders", indexes = {
        @Index(name = "idx_purchase_orders_venue", columnList = "venue_id"),
        @Index(name = "idx_purchase_orders_supplier", columnList = "supplier_id"),
        @Index(name = "idx_purchase_orders_status", columnList = "status")
})
public class PurchaseOrder extends BaseEntity {

    public enum Status {
        DRAFT,
        PENDING,
        APPROVED,
        ORDERED,
        RECEIVED,
        CANCELLED
    }

    @NotNull(message = "Venue ID is required")
    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status = Status.DRAFT;

    @Column(length = 500)
    private String notes;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurchaseOrderLine> lines = new ArrayList<>();

    // Getters and Setters
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
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

    public List<PurchaseOrderLine> getLines() {
        return lines;
    }

    public void setLines(List<PurchaseOrderLine> lines) {
        this.lines = lines;
    }

    public void addLine(PurchaseOrderLine line) {
        lines.add(line);
        line.setPurchaseOrder(this);
    }

    public void removeLine(PurchaseOrderLine line) {
        lines.remove(line);
        line.setPurchaseOrder(null);
    }

    /**
     * Recalculate total amount from line items.
     */
    public void recalculateTotal() {
        this.totalAmount = lines.stream()
                .map(PurchaseOrderLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
