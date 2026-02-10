package de.kesselops.menu.dto;

import de.kesselops.menu.model.MenuSyndication;
import de.kesselops.menu.model.SyndicationStatus;
import de.kesselops.menu.model.SyndicationTarget;

import java.time.Instant;

/**
 * Response DTO for menu syndication data.
 */
public class MenuSyndicationResponse {

    private Long id;
    private Long menuId;
    private SyndicationTarget target;
    private String targetDisplayName;
    private SyndicationStatus status;
    private boolean enabled;
    private String externalId;
    private String externalUrl;
    private Instant lastSyncAt;
    private String lastError;

    public static MenuSyndicationResponse fromEntity(MenuSyndication entity) {
        MenuSyndicationResponse response = new MenuSyndicationResponse();
        response.id = entity.getId();
        response.menuId = entity.getMenu().getId();
        response.target = entity.getTarget();
        response.targetDisplayName = entity.getTarget().getDisplayName();
        response.status = entity.getStatus();
        response.enabled = entity.isEnabled();
        response.externalId = entity.getExternalId();
        response.externalUrl = entity.getExternalUrl();
        response.lastSyncAt = entity.getLastSyncAt();
        response.lastError = entity.getLastError();
        return response;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public SyndicationTarget getTarget() {
        return target;
    }

    public void setTarget(SyndicationTarget target) {
        this.target = target;
    }

    public String getTargetDisplayName() {
        return targetDisplayName;
    }

    public void setTargetDisplayName(String targetDisplayName) {
        this.targetDisplayName = targetDisplayName;
    }

    public SyndicationStatus getStatus() {
        return status;
    }

    public void setStatus(SyndicationStatus status) {
        this.status = status;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

    public Instant getLastSyncAt() {
        return lastSyncAt;
    }

    public void setLastSyncAt(Instant lastSyncAt) {
        this.lastSyncAt = lastSyncAt;
    }

    public String getLastError() {
        return lastError;
    }

    public void setLastError(String lastError) {
        this.lastError = lastError;
    }
}
