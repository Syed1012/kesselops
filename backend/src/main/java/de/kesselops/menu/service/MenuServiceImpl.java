package de.kesselops.menu.service;

import de.kesselops.inventory.model.MenuItem;
import de.kesselops.inventory.repository.MenuItemRepository;
import de.kesselops.menu.dto.MenuRequest;
import de.kesselops.menu.dto.MenuResponse;
import de.kesselops.menu.dto.SyndicationRequest;
import de.kesselops.menu.model.Menu;
import de.kesselops.menu.model.MenuSyndication;
import de.kesselops.menu.model.MenuType;
import de.kesselops.menu.repository.MenuRepository;
import de.kesselops.menu.repository.MenuSyndicationRepository;
import de.kesselops.shared.exception.BusinessRuleException;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of MenuService.
 */
@Service
@Transactional
public class MenuServiceImpl implements MenuService {

    private final MenuRepository menuRepository;
    private final MenuItemRepository menuItemRepository;
    private final MenuSyndicationRepository syndicationRepository;

    public MenuServiceImpl(MenuRepository menuRepository,
            MenuItemRepository menuItemRepository,
            MenuSyndicationRepository syndicationRepository) {
        this.menuRepository = menuRepository;
        this.menuItemRepository = menuItemRepository;
        this.syndicationRepository = syndicationRepository;
    }

    @Override
    public MenuResponse create(MenuRequest request) {
        Menu menu = new Menu();
        mapRequestToEntity(request, menu);
        Menu saved = menuRepository.save(menu);
        return MenuResponse.fromEntitySummary(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MenuResponse getById(Long id, boolean includeItems) {
        Menu menu;
        if (includeItems) {
            menu = menuRepository.findByIdWithItemsAndSyndications(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu", id));
        } else {
            menu = menuRepository.findByIdWithSyndications(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Menu", id));
        }
        return MenuResponse.fromEntity(menu, includeItems);
    }

    @Override
    public MenuResponse update(Long id, MenuRequest request) {
        Menu menu = findByIdOrThrow(id);
        mapRequestToEntity(request, menu);
        Menu saved = menuRepository.save(menu);
        return MenuResponse.fromEntitySummary(saved);
    }

    @Override
    public void deactivate(Long id) {
        Menu menu = findByIdOrThrow(id);
        menu.setActive(false);
        menuRepository.save(menu);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> listByVenue(Long venueId) {
        return menuRepository.findByVenueIdAndActiveTrueOrderByDisplayOrderAsc(venueId).stream()
                .map(MenuResponse::fromEntitySummary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuResponse> listByVenueAndType(Long venueId, MenuType type) {
        return menuRepository.findByVenueIdAndTypeAndActiveTrue(venueId, type).stream()
                .map(MenuResponse::fromEntitySummary)
                .toList();
    }

    @Override
    public MenuResponse addMenuItem(Long menuId, Long menuItemId) {
        Menu menu = menuRepository.findByIdWithItems(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", menuItemId));

        menu.addMenuItem(item);
        Menu saved = menuRepository.save(menu);
        return MenuResponse.fromEntity(saved, true);
    }

    @Override
    public MenuResponse removeMenuItem(Long menuId, Long menuItemId) {
        Menu menu = menuRepository.findByIdWithItems(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", menuItemId));

        menu.removeMenuItem(item);
        Menu saved = menuRepository.save(menu);
        return MenuResponse.fromEntity(saved, true);
    }

    @Override
    public MenuResponse addSyndication(Long menuId, SyndicationRequest request) {
        Menu menu = menuRepository.findByIdWithSyndications(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));

        if (syndicationRepository.existsByMenuIdAndTarget(menuId, request.getTarget())) {
            throw new BusinessRuleException("CONFLICT",
                    "Syndication already exists for target: " + request.getTarget());
        }

        MenuSyndication syndication = new MenuSyndication();
        syndication.setTarget(request.getTarget());
        syndication.setEnabled(request.isEnabled());
        syndication.setConfigJson(request.getConfigJson());

        menu.addSyndication(syndication);
        Menu saved = menuRepository.save(menu);
        return MenuResponse.fromEntitySummary(saved);
    }

    @Override
    public void removeSyndication(Long menuId, Long syndicationId) {
        Menu menu = menuRepository.findByIdWithSyndications(menuId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", menuId));
        MenuSyndication syndication = syndicationRepository.findById(syndicationId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuSyndication", syndicationId));

        if (!syndication.getMenu().getId().equals(menuId)) {
            throw new BusinessRuleException("INVALID", "Syndication does not belong to this menu");
        }

        menu.removeSyndication(syndication);
        syndicationRepository.delete(syndication);
    }

    @Override
    public void toggleSyndication(Long menuId, Long syndicationId, boolean enabled) {
        MenuSyndication syndication = syndicationRepository.findById(syndicationId)
                .orElseThrow(() -> new ResourceNotFoundException("MenuSyndication", syndicationId));

        if (!syndication.getMenu().getId().equals(menuId)) {
            throw new BusinessRuleException("INVALID", "Syndication does not belong to this menu");
        }

        syndication.setEnabled(enabled);
        syndicationRepository.save(syndication);
    }

    private Menu findByIdOrThrow(Long id) {
        return menuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Menu", id));
    }

    private void mapRequestToEntity(MenuRequest request, Menu menu) {
        menu.setName(request.getName());
        menu.setDescription(request.getDescription());
        menu.setType(request.getType());
        menu.setVenueId(request.getVenueId());
        if (request.getDisplayOrder() != null) {
            menu.setDisplayOrder(request.getDisplayOrder());
        }
    }
}
