package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.MenuItemRequest;
import de.kesselops.inventory.dto.MenuItemResponse;
import de.kesselops.inventory.model.MenuCategory;
import de.kesselops.inventory.model.MenuItem;
import de.kesselops.inventory.repository.MenuItemRepository;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of MenuItemService.
 */
@Service
@Transactional
public class MenuItemServiceImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemServiceImpl(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    @Override
    public MenuItemResponse create(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        mapRequestToEntity(request, item);
        MenuItem saved = menuItemRepository.save(item);
        return MenuItemResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuItemResponse getById(Long id) {
        MenuItem item = findByIdOrThrow(id);
        return MenuItemResponse.fromEntity(item);
    }

    @Override
    public MenuItemResponse update(Long id, MenuItemRequest request) {
        MenuItem item = findByIdOrThrow(id);
        mapRequestToEntity(request, item);
        MenuItem saved = menuItemRepository.save(item);
        return MenuItemResponse.fromEntity(saved);
    }

    @Override
    public void deactivate(Long id) {
        MenuItem item = findByIdOrThrow(id);
        item.setActive(false);
        menuItemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> listByVenue(Long venueId, Pageable pageable) {
        return menuItemRepository.findByVenueIdAndActiveTrue(venueId, pageable)
                .map(MenuItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> listByVenueAndCategory(Long venueId, MenuCategory category, Pageable pageable) {
        return menuItemRepository.findByVenueIdAndCategoryAndActiveTrue(venueId, category, pageable)
                .map(MenuItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MenuItemResponse> search(Long venueId, String query, Pageable pageable) {
        return menuItemRepository.searchByVenueId(venueId, query, pageable)
                .map(MenuItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemResponse> getAvailable(Long venueId) {
        return menuItemRepository.findByVenueIdAndActiveTrueAndAvailableTrue(venueId).stream()
                .map(MenuItemResponse::fromEntity)
                .toList();
    }

    @Override
    public MenuItemResponse updateAvailability(Long id, boolean available) {
        MenuItem item = findByIdOrThrow(id);
        item.setAvailable(available);
        MenuItem saved = menuItemRepository.save(item);
        return MenuItemResponse.fromEntity(saved);
    }

    private MenuItem findByIdOrThrow(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", id));
    }

    private void mapRequestToEntity(MenuItemRequest request, MenuItem item) {
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setCategory(request.getCategory());
        item.setPrice(request.getPrice());
        item.setCost(request.getCost() != null ? request.getCost() : BigDecimal.ZERO);
        item.setVenueId(request.getVenueId());
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
    }
}
