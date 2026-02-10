package de.kesselops.inventory.repository;

import de.kesselops.inventory.model.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Supplier entity.
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    /**
     * Find all active suppliers.
     */
    Page<Supplier> findByActiveTrue(Pageable pageable);

    /**
     * Search suppliers by name.
     */
    @Query("SELECT s FROM Supplier s WHERE s.active = true AND LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Supplier> searchByName(@Param("search") String search, Pageable pageable);

    /**
     * Find all active suppliers (for dropdown lists).
     */
    List<Supplier> findByActiveTrueOrderByNameAsc();
}
