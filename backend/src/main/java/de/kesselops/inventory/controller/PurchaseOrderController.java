package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.PurchaseOrderRequest;
import de.kesselops.inventory.dto.PurchaseOrderResponse;
import de.kesselops.inventory.model.PurchaseOrder;
import de.kesselops.inventory.service.PurchaseOrderService;
import de.kesselops.shared.dto.ApiResponse;
import de.kesselops.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for PurchaseOrder operations.
 */
@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> create(
            @Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse response = purchaseOrderService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Purchase order created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getById(@PathVariable Long id) {
        PurchaseOrderResponse response = purchaseOrderService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseOrderResponse>>> list(
            @RequestParam Long venueId,
            @RequestParam(required = false) PurchaseOrder.Status status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<PurchaseOrderResponse> page;
        if (status != null) {
            page = purchaseOrderService.listByVenueAndStatus(venueId, status, pageable);
        } else {
            page = purchaseOrderService.listByVenue(venueId, pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements())));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrder.Status status) {
        PurchaseOrderResponse response = purchaseOrderService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        purchaseOrderService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Purchase order cancelled"));
    }
}
