package de.kesselops.menu.model;

import de.kesselops.shared.model.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * Represents a syndication configuration for a menu to an external platform.
 * Tracks sync status and configuration per platform.
 */
@Entity
@Table(name = "menu_syndications", indexes = {
        @Index(name = "idx_menu_syndications_menu", columnList = "menu_id"),
        @Index(name = "idx_menu_syndications_target", columnList = "target")
}, uniqueConstraints = {
        @UniqueConstraint(columnNames = { "menu_id", "target" })
})
public class MenuSyndication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    @NotNull(message = "Target platform is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SyndicationTarget target;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SyndicationStatus status = SyndicationStatus.PENDING;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "last_sync_at")
    private Instant lastSyncAt;

    @Column(name = "last_error", length = 1000)
    private String lastError;

    @Column(name = "config_json", length = 2000)
    private String configJson;

    // Getters and Setters
    public Menu getMenu() {
        return menu;
    }

    public void setMenu(Menu menu) {
        this.menu = menu;
    }

    public SyndicationTarget getTarget() {
        return target;
    }

    public void setTarget(SyndicationTarget target) {
        this.target = target;
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

    public String getConfigJson() {
        return configJson;
    }

    public void setConfigJson(String configJson) {
        this.configJson = configJson;
    }

    /**
     * Mark this syndication as synced successfully.
     */
    public void markSynced() {
        this.status = SyndicationStatus.SUCCESS;
        this.lastSyncAt = Instant.now();
        this.lastError = null;
    }

    /**
     * Mark this syndication as failed.
     */
    public void markFailed(String error) {
        this.status = SyndicationStatus.FAILED;
        this.lastError = error;
    }
}
