package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for InventoryItem entity with custom query methods.
 */
@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    /**
     * Find all inventory items for a venue.
     */
    Page<InventoryItem> findByVenueIdAndActiveTrue(Long venueId, Pageable pageable);

    /**
     * Find all inventory items for a venue including inactive.
     */
    Page<InventoryItem> findByVenueId(Long venueId, Pageable pageable);

    /**
     * Find by SKU within a venue (for duplicate checking).
     */
    Optional<InventoryItem> findByVenueIdAndSku(Long venueId, String sku);

    /**
     * Find low stock items (quantity <= reorderLevel) for a venue.
     */
    @Query("SELECT i FROM InventoryItem i WHERE i.venueId = :venueId AND i.active = true AND i.quantityOnHand <= i.reorderLevel")
    List<InventoryItem> findLowStockByVenueId(@Param("venueId") Long venueId);

    /**
     * Search by name or SKU.
     */
    @Query("SELECT i FROM InventoryItem i WHERE i.venueId = :venueId AND i.active = true AND (LOWER(i.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<InventoryItem> searchByVenueId(@Param("venueId") Long venueId, @Param("search") String search,
            Pageable pageable);

    /**
     * Find all items by supplier.
     */
    List<InventoryItem> findBySupplierId(Long supplierId);

    /**
     * Check if any items exist for a supplier (for deletion validation).
     */
    boolean existsBySupplierId(Long supplierId);
}
