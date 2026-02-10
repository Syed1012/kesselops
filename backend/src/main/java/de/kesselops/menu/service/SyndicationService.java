package de.kesselops.menu.service;

import de.kesselops.menu.model.Menu;
import de.kesselops.menu.model.MenuSyndication;
import de.kesselops.menu.model.SyndicationTarget;

/**
 * Service interface for syndicating menus to external platforms.
 * This is a stub that will be implemented when integrations are ready.
 */
public interface SyndicationService {

    /**
     * Sync a menu to a specific external platform.
     *
     * @param syndication The syndication configuration to sync
     * @return true if sync was successful
     */
    boolean syncToTarget(MenuSyndication syndication);

    /**
     * Sync a menu to all enabled targets.
     *
     * @param menu The menu to sync
     */
    void syncAllTargets(Menu menu);

    /**
     * Trigger a resync for all pending syndications.
     */
    void syncPending();

    /**
     * Check if a target platform is available for syncing.
     *
     * @param target The target platform
     * @return true if the platform API is available
     */
    boolean isTargetAvailable(SyndicationTarget target);
}
