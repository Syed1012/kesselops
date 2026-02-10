package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.SupplierRequest;
import de.kesselops.inventory.dto.SupplierResponse;
import de.kesselops.inventory.model.Supplier;
import de.kesselops.inventory.repository.InventoryItemRepository;
import de.kesselops.inventory.repository.SupplierRepository;
import de.kesselops.shared.exception.BusinessRuleException;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Implementation of SupplierService.
 */
@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository,
            InventoryItemRepository inventoryItemRepository) {
        this.supplierRepository = supplierRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    @Override
    public SupplierResponse create(SupplierRequest request) {
        Supplier supplier = new Supplier();
        mapRequestToEntity(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        Supplier supplier = findByIdOrThrow(id);
        return SupplierResponse.fromEntity(supplier);
    }

    @Override
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = findByIdOrThrow(id);
        mapRequestToEntity(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        return SupplierResponse.fromEntity(saved);
    }

    @Override
    public void deactivate(Long id) {
        Supplier supplier = findByIdOrThrow(id);

        // Check if supplier has active inventory items
        if (inventoryItemRepository.existsBySupplierId(id)) {
            throw new BusinessRuleException("CONFLICT",
                    "Cannot deactivate supplier with linked inventory items");
        }

        supplier.setActive(false);
        supplierRepository.save(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> list(Pageable pageable) {
        return supplierRepository.findByActiveTrue(pageable)
                .map(SupplierResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierResponse> search(String query, Pageable pageable) {
        return supplierRepository.searchByName(query, pageable)
                .map(SupplierResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponse> listAll() {
        return supplierRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(SupplierResponse::fromEntity)
                .toList();
    }

    private Supplier findByIdOrThrow(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }

    private void mapRequestToEntity(SupplierRequest request, Supplier supplier) {
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setNotes(request.getNotes());
    }
}
