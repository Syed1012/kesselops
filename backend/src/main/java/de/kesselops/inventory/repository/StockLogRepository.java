package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.StockLog;
import de.kesselops.inventory.model.StockLogType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for StockLog entity.
 */
@Repository
public interface StockLogRepository extends JpaRepository<StockLog, Long> {

    /**
     * Find logs for an inventory item (paginated).
     */
    Page<StockLog> findByInventoryItemIdOrderByCreatedAtDesc(Long inventoryItemId, Pageable pageable);

    /**
     * Find logs by type for an inventory item.
     */
    List<StockLog> findByInventoryItemIdAndType(Long inventoryItemId, StockLogType type);

    /**
     * Find logs in a time range.
     */
    List<StockLog> findByInventoryItemIdAndCreatedAtBetween(
            Long inventoryItemId, Instant start, Instant end);

    /**
     * Find logs by reference (e.g., order ID).
     */
    List<StockLog> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
