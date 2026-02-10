package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for PurchaseOrder entity.
 */
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    Page<PurchaseOrder> findByVenueIdOrderByCreatedAtDesc(Long venueId, Pageable pageable);

    List<PurchaseOrder> findByVenueIdAndStatus(Long venueId, PurchaseOrder.Status status);

    Page<PurchaseOrder> findByVenueIdAndStatusOrderByCreatedAtDesc(
            Long venueId, PurchaseOrder.Status status, Pageable pageable);
}
