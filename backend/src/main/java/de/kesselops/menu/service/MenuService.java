package de.kesselops.menu.service;

import de.kesselops.menu.dto.MenuRequest;
import de.kesselops.menu.dto.MenuResponse;
import de.kesselops.menu.dto.SyndicationRequest;
import de.kesselops.menu.model.MenuType;

import java.util.List;

/**
 * Service interface for Menu operations.
 */
public interface MenuService {

    MenuResponse create(MenuRequest request);

    MenuResponse getById(Long id, boolean includeItems);

    MenuResponse update(Long id, MenuRequest request);

    void deactivate(Long id);

    List<MenuResponse> listByVenue(Long venueId);

    List<MenuResponse> listByVenueAndType(Long venueId, MenuType type);

    MenuResponse addMenuItem(Long menuId, Long menuItemId);

    MenuResponse removeMenuItem(Long menuId, Long menuItemId);

    MenuResponse addSyndication(Long menuId, SyndicationRequest request);

    void removeSyndication(Long menuId, Long syndicationId);

    void toggleSyndication(Long menuId, Long syndicationId, boolean enabled);
}
