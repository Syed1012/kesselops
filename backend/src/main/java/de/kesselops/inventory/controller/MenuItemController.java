package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.MenuItemRequest;
import de.kesselops.inventory.dto.MenuItemResponse;
import de.kesselops.inventory.model.MenuCategory;
import de.kesselops.inventory.service.MenuItemService;
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
 * REST controller for MenuItem operations.
 */
@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuItemResponse>> create(
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = menuItemService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Menu item created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getById(@PathVariable Long id) {
        MenuItemResponse response = menuItemService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuItemResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = menuItemService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Menu item updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        menuItemService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu item deactivated"));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<MenuItemResponse>> list(
            @RequestParam Long venueId,
            @RequestParam(required = false) MenuCategory category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<MenuItemResponse> page;
        if (search != null && !search.isBlank()) {
            page = menuItemService.search(venueId, search, pageable);
        } else if (category != null) {
            page = menuItemService.listByVenueAndCategory(venueId, category, pageable);
        } else {
            page = menuItemService.listByVenue(venueId, pageable);
        }
        return ResponseEntity.ok(PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAvailable(
            @RequestParam Long venueId) {
        List<MenuItemResponse> items = menuItemService.getAvailable(venueId);
        return ResponseEntity.ok(ApiResponse.success(items));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {
        MenuItemResponse response = menuItemService.updateAvailability(id, available);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
