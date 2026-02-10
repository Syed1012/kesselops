package de.kesselops.menu.service;

import de.kesselops.menu.model.Menu;
import de.kesselops.menu.model.MenuSyndication;
import de.kesselops.menu.model.SyndicationStatus;
import de.kesselops.menu.model.SyndicationTarget;
import de.kesselops.menu.repository.MenuSyndicationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Stub implementation of SyndicationService.
 * Will be replaced with actual API integrations in the future.
 */
@Service
@Transactional
public class SyndicationServiceImpl implements SyndicationService {

    private static final Logger log = LoggerFactory.getLogger(SyndicationServiceImpl.class);

    private final MenuSyndicationRepository syndicationRepository;

    public SyndicationServiceImpl(MenuSyndicationRepository syndicationRepository) {
        this.syndicationRepository = syndicationRepository;
    }

    @Override
    public boolean syncToTarget(MenuSyndication syndication) {
        log.info("Syncing menu {} to {}", syndication.getMenu().getName(), syndication.getTarget());

        try {
            // TODO: Implement actual API calls based on target
            switch (syndication.getTarget()) {
                case SPEISEKARTE_DE -> syncToSpeisekarte(syndication);
                case GOOGLE_BUSINESS -> syncToGoogleBusiness(syndication);
                case TRIPADVISOR -> syncToTripAdvisor(syndication);
                case UBER_EATS -> syncToUberEats(syndication);
                case LIEFERANDO -> syncToLieferando(syndication);
                case WOLT -> syncToWolt(syndication);
            }

            syndication.markSynced();
            syndicationRepository.save(syndication);
            log.info("Successfully synced menu {} to {}", syndication.getMenu().getName(), syndication.getTarget());
            return true;

        } catch (Exception e) {
            log.error("Failed to sync menu {} to {}: {}",
                    syndication.getMenu().getName(), syndication.getTarget(), e.getMessage());
            syndication.markFailed(e.getMessage());
            syndicationRepository.save(syndication);
            return false;
        }
    }

    @Override
    public void syncAllTargets(Menu menu) {
        for (MenuSyndication syndication : menu.getSyndications()) {
            if (syndication.isEnabled()) {
                syncToTarget(syndication);
            }
        }
    }

    @Override
    public void syncPending() {
        List<MenuSyndication> pending = syndicationRepository.findByEnabledTrueAndStatus(SyndicationStatus.PENDING);
        log.info("Found {} pending syndications to sync", pending.size());

        for (MenuSyndication syndication : pending) {
            syncToTarget(syndication);
        }
    }

    @Override
    public boolean isTargetAvailable(SyndicationTarget target) {
        // TODO: Implement health checks for each platform
        log.debug("Checking availability for {}", target);
        return true; // Stub: always available
    }

    // Stub implementations for each platform
    private void syncToSpeisekarte(MenuSyndication syndication) {
        log.debug("STUB: Would sync to speisekarte.de");
        // TODO: Implement speisekarte.de API integration
    }

    private void syncToGoogleBusiness(MenuSyndication syndication) {
        log.debug("STUB: Would sync to Google Business Profile");
        // TODO: Implement Google Business Profile API integration
    }

    private void syncToTripAdvisor(MenuSyndication syndication) {
        log.debug("STUB: Would sync to TripAdvisor");
        // TODO: Implement TripAdvisor API integration
    }

    private void syncToUberEats(MenuSyndication syndication) {
        log.debug("STUB: Would sync to Uber Eats");
        // TODO: Implement Uber Eats API integration
    }

    private void syncToLieferando(MenuSyndication syndication) {
        log.debug("STUB: Would sync to Lieferando");
        // TODO: Implement Lieferando API integration
    }

    private void syncToWolt(MenuSyndication syndication) {
        log.debug("STUB: Would sync to Wolt");
        // TODO: Implement Wolt API integration
    }
}
