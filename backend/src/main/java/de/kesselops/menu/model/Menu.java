package de.kesselops.menu.model;

import de.kesselops.inventory.model.MenuItem;
import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a menu that contains multiple menu items.
 * A venue can have multiple menus (Drinks, Food, Happy Hour, etc.)
 * Each menu can contain multiple items, and items can appear in multiple menus.
 */
@Entity
@Table(name = "menus", indexes = {
        @Index(name = "idx_menus_venue", columnList = "venue_id"),
        @Index(name = "idx_menus_type", columnList = "type")
})
public class Menu extends BaseEntity {

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotNull(message = "Menu type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MenuType type;

    @NotNull(message = "Venue ID is required")
    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @ManyToMany
    @JoinTable(name = "menu_menu_items", joinColumns = @JoinColumn(name = "menu_id"), inverseJoinColumns = @JoinColumn(name = "menu_item_id"))
    private Set<MenuItem> menuItems = new HashSet<>();

    @OneToMany(mappedBy = "menu", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<MenuSyndication> syndications = new HashSet<>();

    // Getters and Setters
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

    public Set<MenuItem> getMenuItems() {
        return menuItems;
    }

    public void setMenuItems(Set<MenuItem> menuItems) {
        this.menuItems = menuItems;
    }

    public void addMenuItem(MenuItem item) {
        menuItems.add(item);
    }

    public void removeMenuItem(MenuItem item) {
        menuItems.remove(item);
    }

    public Set<MenuSyndication> getSyndications() {
        return syndications;
    }

    public void setSyndications(Set<MenuSyndication> syndications) {
        this.syndications = syndications;
    }

    public void addSyndication(MenuSyndication syndication) {
        syndications.add(syndication);
        syndication.setMenu(this);
    }

    public void removeSyndication(MenuSyndication syndication) {
        syndications.remove(syndication);
        syndication.setMenu(null);
    }
}
