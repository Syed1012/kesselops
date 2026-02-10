package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.PurchaseOrderRequest;
import de.kesselops.inventory.dto.PurchaseOrderResponse;
import de.kesselops.inventory.model.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for PurchaseOrder operations.
 */
public interface PurchaseOrderService {

    /**
     * Create a new purchase order.
     */
    PurchaseOrderResponse create(PurchaseOrderRequest request);

    /**
     * Get a purchase order by ID.
     */
    PurchaseOrderResponse getById(Long id);

    /**
     * List purchase orders for a venue (paginated).
     */
    Page<PurchaseOrderResponse> listByVenue(Long venueId, Pageable pageable);

    /**
     * List purchase orders for a venue filtered by status.
     */
    Page<PurchaseOrderResponse> listByVenueAndStatus(Long venueId, PurchaseOrder.Status status, Pageable pageable);

    /**
     * Update order status.
     */
    PurchaseOrderResponse updateStatus(Long id, PurchaseOrder.Status status);

    /**
     * Cancel a purchase order.
     */
    void cancel(Long id);
}
