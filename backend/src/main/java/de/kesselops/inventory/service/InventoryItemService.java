package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.InventoryItemRequest;
import de.kesselops.inventory.dto.InventoryItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for InventoryItem operations.
 * Follows Interface Segregation Principle - focused on inventory item
 * management.
 */
public interface InventoryItemService {

    /**
     * Create a new inventory item.
     */
    InventoryItemResponse create(InventoryItemRequest request);

    /**
     * Get an inventory item by ID.
     */
    InventoryItemResponse getById(Long id);

    /**
     * Update an existing inventory item.
     */
    InventoryItemResponse update(Long id, InventoryItemRequest request);

    /**
     * Soft-delete (deactivate) an inventory item.
     */
    void deactivate(Long id);

    /**
     * List all inventory items for a venue (paginated).
     */
    Page<InventoryItemResponse> listByVenue(Long venueId, Pageable pageable);

    /**
     * Search inventory items by name or SKU.
     */
    Page<InventoryItemResponse> search(Long venueId, String query, Pageable pageable);

    /**
     * Get all low stock items for a venue.
     */
    List<InventoryItemResponse> getLowStock(Long venueId);
}
