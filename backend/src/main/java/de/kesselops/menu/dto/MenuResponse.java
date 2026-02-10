package de.kesselops.menu.dto;

import de.kesselops.inventory.dto.MenuItemResponse;
import de.kesselops.menu.model.Menu;
import de.kesselops.menu.model.MenuType;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO for menu data.
 */
public class MenuResponse {

    private Long id;
    private String name;
    private String description;
    private MenuType type;
    private Long venueId;
    private boolean active;
    private Integer displayOrder;
    private int itemCount;
    private List<MenuItemResponse> items;
    private List<MenuSyndicationResponse> syndications;
    private Instant createdAt;
    private Instant updatedAt;

    public static MenuResponse fromEntity(Menu entity, boolean includeItems) {
        MenuResponse response = new MenuResponse();
        response.id = entity.getId();
        response.name = entity.getName();
        response.description = entity.getDescription();
        response.type = entity.getType();
        response.venueId = entity.getVenueId();
        response.active = entity.isActive();
        response.displayOrder = entity.getDisplayOrder();
        response.itemCount = entity.getMenuItems().size();
        response.createdAt = entity.getCreatedAt();
        response.updatedAt = entity.getUpdatedAt();

        if (includeItems) {
            response.items = entity.getMenuItems().stream()
                    .map(MenuItemResponse::fromEntity)
                    .toList();
        }

        response.syndications = entity.getSyndications().stream()
                .map(MenuSyndicationResponse::fromEntity)
                .toList();

        return response;
    }

    public static MenuResponse fromEntitySummary(Menu entity) {
        return fromEntity(entity, false);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public MenuType getType() {
        return type;
    }

    public void setType(MenuType type) {
        this.type = type;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public int getItemCount() {
        return itemCount;
    }

    public void setItemCount(int itemCount) {
        this.itemCount = itemCount;
    }

    public List<MenuItemResponse> getItems() {
        return items;
    }

    public void setItems(List<MenuItemResponse> items) {
        this.items = items;
    }

    public List<MenuSyndicationResponse> getSyndications() {
        return syndications;
    }

    public void setSyndications(List<MenuSyndicationResponse> syndications) {
        this.syndications = syndications;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
