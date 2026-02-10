package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.InventoryItemRequest;
import de.kesselops.inventory.dto.InventoryItemResponse;
import de.kesselops.inventory.service.InventoryItemService;
import de.kesselops.shared.dto.ApiResponse;
import de.kesselops.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for InventoryItem operations.
 */
@RestController
@RequestMapping("/api/inventory-items")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<InventoryItemResponse>> create(
            @Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse response = inventoryItemService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Inventory item created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> getById(@PathVariable Long id) {
        InventoryItemResponse response = inventoryItemService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<InventoryItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryItemRequest request) {
        InventoryItemResponse response = inventoryItemService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory item updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        inventoryItemService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Inventory item deactivated"));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<InventoryItemResponse>> list(
            @RequestParam Long venueId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<InventoryItemResponse> page;
        if (search != null && !search.isBlank()) {
            page = inventoryItemService.search(venueId, search, pageable);
        } else {
            page = inventoryItemService.listByVenue(venueId, pageable);
        }
        return ResponseEntity.ok(PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<InventoryItemResponse>>> getLowStock(
            @RequestParam Long venueId) {
        List<InventoryItemResponse> items = inventoryItemService.getLowStock(venueId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }
}
