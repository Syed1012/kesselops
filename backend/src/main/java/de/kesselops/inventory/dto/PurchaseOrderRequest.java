package de.kesselops.inventory.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request DTO for creating a purchase order.
 */
public class PurchaseOrderRequest {

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    private Long supplierId;

    private String notes;

    @NotEmpty(message = "At least one line item is required")
    @Valid
    private List<PurchaseOrderLineRequest> lines;

    // Getters and Setters
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<PurchaseOrderLineRequest> getLines() {
        return lines;
    }

    public void setLines(List<PurchaseOrderLineRequest> lines) {
        this.lines = lines;
    }
}
