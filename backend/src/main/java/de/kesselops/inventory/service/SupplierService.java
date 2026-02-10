package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.SupplierRequest;
import de.kesselops.inventory.dto.SupplierResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for Supplier operations.
 */
public interface SupplierService {

    /**
     * Create a new supplier.
     */
    SupplierResponse create(SupplierRequest request);

    /**
     * Get a supplier by ID.
     */
    SupplierResponse getById(Long id);

    /**
     * Update an existing supplier.
     */
    SupplierResponse update(Long id, SupplierRequest request);

    /**
     * Soft-delete (deactivate) a supplier.
     */
    void deactivate(Long id);

    /**
     * List all suppliers (paginated).
     */
    Page<SupplierResponse> list(Pageable pageable);

    /**
     * Search suppliers by name.
     */
    Page<SupplierResponse> search(String query, Pageable pageable);

    /**
     * Get all active suppliers (for dropdowns).
     */
    List<SupplierResponse> listAll();
}
