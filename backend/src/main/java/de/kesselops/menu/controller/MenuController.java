package de.kesselops.menu.controller;

import de.kesselops.menu.dto.MenuRequest;
import de.kesselops.menu.dto.MenuResponse;
import de.kesselops.menu.dto.SyndicationRequest;
import de.kesselops.menu.model.MenuType;
import de.kesselops.menu.service.MenuService;
import de.kesselops.menu.service.SyndicationService;
import de.kesselops.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Menu operations.
 */
@RestController
@RequestMapping("/api/menus")
public class MenuController {

    private final MenuService menuService;
    private final SyndicationService syndicationService;

    public MenuController(MenuService menuService, SyndicationService syndicationService) {
        this.menuService = menuService;
        this.syndicationService = syndicationService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MenuResponse>> create(
            @Valid @RequestBody MenuRequest request) {
        MenuResponse response = menuService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Menu created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuResponse>> getById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeItems) {
        MenuResponse response = menuService.getById(id, includeItems);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MenuResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MenuRequest request) {
        MenuResponse response = menuService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Menu updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        menuService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Menu deactivated"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MenuResponse>>> list(
            @RequestParam Long venueId,
            @RequestParam(required = false) MenuType type) {
        List<MenuResponse> menus;
        if (type != null) {
            menus = menuService.listByVenueAndType(venueId, type);
        } else {
            menus = menuService.listByVenue(venueId);
        }
        return ResponseEntity.ok(ApiResponse.success(menus));
    }

    // Menu Item Management
    @PostMapping("/{id}/items/{menuItemId}")
    public ResponseEntity<ApiResponse<MenuResponse>> addItem(
            @PathVariable Long id,
            @PathVariable Long menuItemId) {
        MenuResponse response = menuService.addMenuItem(id, menuItemId);
        return ResponseEntity.ok(ApiResponse.success(response, "Item added to menu"));
    }

    @DeleteMapping("/{id}/items/{menuItemId}")
    public ResponseEntity<ApiResponse<MenuResponse>> removeItem(
            @PathVariable Long id,
            @PathVariable Long menuItemId) {
        MenuResponse response = menuService.removeMenuItem(id, menuItemId);
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from menu"));
    }

    // Syndication Management
    @PostMapping("/{id}/syndications")
    public ResponseEntity<ApiResponse<MenuResponse>> addSyndication(
            @PathVariable Long id,
            @Valid @RequestBody SyndicationRequest request) {
        MenuResponse response = menuService.addSyndication(id, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Syndication added"));
    }

    @DeleteMapping("/{id}/syndications/{syndicationId}")
    public ResponseEntity<ApiResponse<Void>> removeSyndication(
            @PathVariable Long id,
            @PathVariable Long syndicationId) {
        menuService.removeSyndication(id, syndicationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Syndication removed"));
    }

    @PatchMapping("/{id}/syndications/{syndicationId}")
    public ResponseEntity<ApiResponse<Void>> toggleSyndication(
            @PathVariable Long id,
            @PathVariable Long syndicationId,
            @RequestParam boolean enabled) {
        menuService.toggleSyndication(id, syndicationId, enabled);
        return ResponseEntity.ok(ApiResponse.success(null, enabled ? "Syndication enabled" : "Syndication disabled"));
    }

    @PostMapping("/{id}/sync")
    public ResponseEntity<ApiResponse<Void>> syncMenu(@PathVariable Long id) {
        MenuResponse menu = menuService.getById(id, false);
        // Get full menu with syndications for syncing
        MenuResponse fullMenu = menuService.getById(id, true);
        // Note: In real implementation, we'd pass the Menu entity
        return ResponseEntity.ok(ApiResponse.success(null, "Sync initiated for menu: " + menu.getName()));
    }
}
