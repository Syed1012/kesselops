package de.kesselops.menu.dto;

import de.kesselops.menu.model.SyndicationTarget;
import jakarta.validation.constraints.NotNull;

/**
 * Request DTO for creating a syndication configuration.
 */
public class SyndicationRequest {

    @NotNull(message = "Target platform is required")
    private SyndicationTarget target;

    private boolean enabled = true;

    private String configJson;

    // Getters and Setters
    public SyndicationTarget getTarget() {
        return target;
    }

    public void setTarget(SyndicationTarget target) {
        this.target = target;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getConfigJson() {
        return configJson;
    }

    public void setConfigJson(String configJson) {
        this.configJson = configJson;
    }
}
