package de.kesselops.inventory.service;

import de.kesselops.inventory.model.StockLogType;

import java.math.BigDecimal;

/**
 * Service interface for managing stock depletion.
 * Called by Guest module when orders are confirmed.
 */
public interface StockDepletionService {

    /**
     * Deplete inventory for a menu item (based on recipe).
     *
     * @param menuItemId The menu item being ordered
     * @param quantity   Number of units ordered
     * @param orderId    Reference to the order (for audit trail)
     */
    void depleteForMenuItem(Long menuItemId, int quantity, Long orderId);

    /**
     * Record a stock adjustment (delivery, waste, manual adjustment).
     *
     * @param inventoryItemId The inventory item
     * @param type            Type of adjustment
     * @param quantity        Quantity to add (positive) or remove (negative)
     * @param reason          Reason for adjustment
     * @param performedBy     User ID who performed the adjustment
     */
    void recordStockChange(Long inventoryItemId, StockLogType type, BigDecimal quantity,
            String reason, Long performedBy);

    /**
     * Record a delivery from supplier.
     */
    void recordDelivery(Long inventoryItemId, BigDecimal quantity, String notes, Long performedBy);

    /**
     * Record waste/spoilage.
     */
    void recordWaste(Long inventoryItemId, BigDecimal quantity, String reason, Long performedBy);
}
