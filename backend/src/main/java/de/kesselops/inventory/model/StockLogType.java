package de.kesselops.inventory.model;

/**
 * Type of stock movement for audit trail.
 */
public enum StockLogType {
    /**
     * Stock received from supplier delivery.
     */
    DELIVERY,

    /**
     * Stock consumed via order/recipe fulfillment.
     */
    DEPLETION,

    /**
     * Stock lost due to breakage, spoilage, etc.
     */
    WASTE,

    /**
     * Manual adjustment for inventory corrections.
     */
    ADJUSTMENT
}
