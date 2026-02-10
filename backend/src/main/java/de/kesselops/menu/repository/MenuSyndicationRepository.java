package de.kesselops.menu.repository;

import de.kesselops.menu.model.MenuSyndication;
import de.kesselops.menu.model.SyndicationStatus;
import de.kesselops.menu.model.SyndicationTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for MenuSyndication entity.
 */
@Repository
public interface MenuSyndicationRepository extends JpaRepository<MenuSyndication, Long> {

    /**
     * Find all syndications for a menu.
     */
    List<MenuSyndication> findByMenuId(Long menuId);

    /**
     * Find syndication by menu and target.
     */
    Optional<MenuSyndication> findByMenuIdAndTarget(Long menuId, SyndicationTarget target);

    /**
     * Check if syndication exists for menu and target.
     */
    boolean existsByMenuIdAndTarget(Long menuId, SyndicationTarget target);

    /**
     * Find all enabled syndications pending sync.
     */
    List<MenuSyndication> findByEnabledTrueAndStatus(SyndicationStatus status);

    /**
     * Find all enabled syndications for a specific target.
     */
    List<MenuSyndication> findByTargetAndEnabledTrue(SyndicationTarget target);
}
