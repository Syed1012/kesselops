package de.kesselops.inventory.service;

import de.kesselops.inventory.model.*;
import de.kesselops.inventory.repository.*;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Implementation of StockDepletionService.
 * Handles stock movements and audit logging.
 */
@Service
@Transactional
public class StockDepletionServiceImpl implements StockDepletionService {

    private static final Logger log = LoggerFactory.getLogger(StockDepletionServiceImpl.class);

    private final InventoryItemRepository inventoryItemRepository;
    private final RecipeRepository recipeRepository;
    private final StockLogRepository stockLogRepository;

    public StockDepletionServiceImpl(InventoryItemRepository inventoryItemRepository,
            RecipeRepository recipeRepository,
            StockLogRepository stockLogRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.recipeRepository = recipeRepository;
        this.stockLogRepository = stockLogRepository;
    }

    @Override
    public void depleteForMenuItem(Long menuItemId, int quantity, Long orderId) {
        Recipe recipe = recipeRepository.findByMenuItemIdWithIngredients(menuItemId).orElse(null);

        if (recipe == null || recipe.getIngredients().isEmpty()) {
            log.warn("No recipe found for menu item {}, skipping depletion", menuItemId);
            return;
        }

        for (RecipeIngredient ingredient : recipe.getIngredients()) {
            BigDecimal depletionAmount = ingredient.getQuantity()
                    .multiply(BigDecimal.valueOf(quantity));

            InventoryItem item = ingredient.getInventoryItem();
            BigDecimal quantityBefore = item.getQuantityOnHand();
            BigDecimal quantityAfter = quantityBefore.subtract(depletionAmount);

            // Update inventory
            item.setQuantityOnHand(quantityAfter);
            inventoryItemRepository.save(item);

            // Create audit log
            StockLog stockLog = new StockLog();
            stockLog.setInventoryItem(item);
            stockLog.setType(StockLogType.DEPLETION);
            stockLog.setQuantity(depletionAmount.negate()); // Negative for depletion
            stockLog.setQuantityBefore(quantityBefore);
            stockLog.setQuantityAfter(quantityAfter);
            stockLog.setReason("Order fulfillment");
            stockLog.setReferenceType("ORDER");
            stockLog.setReferenceId(orderId);
            stockLogRepository.save(stockLog);

            log.debug("Depleted {} of {} for order {}", depletionAmount, item.getName(), orderId);
        }
    }

    @Override
    public void recordStockChange(Long inventoryItemId, StockLogType type, BigDecimal quantity,
            String reason, Long performedBy) {
        InventoryItem item = inventoryItemRepository.findById(inventoryItemId)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", inventoryItemId));

        BigDecimal quantityBefore = item.getQuantityOnHand();
        BigDecimal quantityAfter = quantityBefore.add(quantity);

        // Update inventory
        item.setQuantityOnHand(quantityAfter);
        inventoryItemRepository.save(item);

        // Create audit log
        StockLog stockLog = new StockLog();
        stockLog.setInventoryItem(item);
        stockLog.setType(type);
        stockLog.setQuantity(quantity);
        stockLog.setQuantityBefore(quantityBefore);
        stockLog.setQuantityAfter(quantityAfter);
        stockLog.setReason(reason);
        stockLog.setPerformedBy(performedBy);
        stockLogRepository.save(stockLog);

        log.info("Stock change recorded for {}: {} {} ({})",
                item.getName(), quantity, type, reason);
    }

    @Override
    public void recordDelivery(Long inventoryItemId, BigDecimal quantity, String notes, Long performedBy) {
        recordStockChange(inventoryItemId, StockLogType.DELIVERY, quantity, notes, performedBy);
    }

    @Override
    public void recordWaste(Long inventoryItemId, BigDecimal quantity, String reason, Long performedBy) {
        // Waste is a reduction, so negate the quantity
        recordStockChange(inventoryItemId, StockLogType.WASTE, quantity.negate(), reason, performedBy);
    }
}
