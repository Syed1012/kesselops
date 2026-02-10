package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.MenuItemRequest;
import de.kesselops.inventory.dto.MenuItemResponse;
import de.kesselops.inventory.model.MenuCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for MenuItem operations.
 */
public interface MenuItemService {

    MenuItemResponse create(MenuItemRequest request);

    MenuItemResponse getById(Long id);

    MenuItemResponse update(Long id, MenuItemRequest request);

    void deactivate(Long id);

    Page<MenuItemResponse> listByVenue(Long venueId, Pageable pageable);

    Page<MenuItemResponse> listByVenueAndCategory(Long venueId, MenuCategory category, Pageable pageable);

    Page<MenuItemResponse> search(Long venueId, String query, Pageable pageable);

    List<MenuItemResponse> getAvailable(Long venueId);

    MenuItemResponse updateAvailability(Long id, boolean available);
}
