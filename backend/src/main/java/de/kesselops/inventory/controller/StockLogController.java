package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.StockLogResponse;
import de.kesselops.inventory.model.StockLogType;
import de.kesselops.inventory.repository.StockLogRepository;
import de.kesselops.inventory.service.StockDepletionService;
import de.kesselops.shared.dto.ApiResponse;
import de.kesselops.shared.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * REST controller for StockLog and stock movement operations.
 */
@RestController
@RequestMapping("/api/stock")
public class StockLogController {

    private final StockLogRepository stockLogRepository;
    private final StockDepletionService stockDepletionService;

    public StockLogController(StockLogRepository stockLogRepository,
            StockDepletionService stockDepletionService) {
        this.stockLogRepository = stockLogRepository;
        this.stockDepletionService = stockDepletionService;
    }

    @GetMapping("/logs")
    public ResponseEntity<PagedResponse<StockLogResponse>> getLogs(
            @RequestParam Long inventoryItemId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<StockLogResponse> page = stockLogRepository
                .findByInventoryItemIdOrderByCreatedAtDesc(inventoryItemId, pageable)
                .map(StockLogResponse::fromEntity);
        return ResponseEntity.ok(PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()));
    }

    @PostMapping("/delivery")
    public ResponseEntity<ApiResponse<Void>> recordDelivery(
            @RequestParam Long inventoryItemId,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) Long performedBy) {
        stockDepletionService.recordDelivery(inventoryItemId, quantity, notes, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Delivery recorded"));
    }

    @PostMapping("/waste")
    public ResponseEntity<ApiResponse<Void>> recordWaste(
            @RequestParam Long inventoryItemId,
            @RequestParam BigDecimal quantity,
            @RequestParam String reason,
            @RequestParam(required = false) Long performedBy) {
        stockDepletionService.recordWaste(inventoryItemId, quantity, reason, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Waste recorded"));
    }

    @PostMapping("/adjustment")
    public ResponseEntity<ApiResponse<Void>> recordAdjustment(
            @RequestParam Long inventoryItemId,
            @RequestParam BigDecimal quantity,
            @RequestParam String reason,
            @RequestParam(required = false) Long performedBy) {
        stockDepletionService.recordStockChange(inventoryItemId, StockLogType.ADJUSTMENT,
                quantity, reason, performedBy);
        return ResponseEntity.ok(ApiResponse.success(null, "Adjustment recorded"));
    }

    /**
     * Internal endpoint for Guest module to deplete stock when orders are
     * confirmed.
     */
    @PostMapping("/deplete")
    public ResponseEntity<ApiResponse<Void>> depleteForOrder(
            @RequestParam Long menuItemId,
            @RequestParam int quantity,
            @RequestParam Long orderId) {
        stockDepletionService.depleteForMenuItem(menuItemId, quantity, orderId);
        return ResponseEntity.ok(ApiResponse.success(null, "Stock depleted"));
    }
}
