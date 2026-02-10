package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.InventoryItemRequest;
import de.kesselops.inventory.dto.InventoryItemResponse;
import de.kesselops.inventory.model.InventoryItem;
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
 * Implementation of InventoryItemService.
 * Handles all inventory item business logic.
 */
@Service
@Transactional
public class InventoryItemServiceImpl implements InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final SupplierRepository supplierRepository;

    public InventoryItemServiceImpl(InventoryItemRepository inventoryItemRepository,
            SupplierRepository supplierRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.supplierRepository = supplierRepository;
    }

    @Override
    public InventoryItemResponse create(InventoryItemRequest request) {
        // Check for duplicate SKU in venue
        inventoryItemRepository.findByVenueIdAndSku(request.getVenueId(), request.getSku())
                .ifPresent(existing -> {
                    throw new BusinessRuleException("CONFLICT",
                            "SKU already exists in this venue: " + request.getSku(), "sku");
                });

        InventoryItem item = new InventoryItem();
        mapRequestToEntity(request, item);

        InventoryItem saved = inventoryItemRepository.save(item);
        return InventoryItemResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryItemResponse getById(Long id) {
        InventoryItem item = findByIdOrThrow(id);
        return InventoryItemResponse.fromEntity(item);
    }

    @Override
    public InventoryItemResponse update(Long id, InventoryItemRequest request) {
        InventoryItem item = findByIdOrThrow(id);

        // Check for duplicate SKU if changed
        if (!item.getSku().equals(request.getSku())) {
            inventoryItemRepository.findByVenueIdAndSku(request.getVenueId(), request.getSku())
                    .ifPresent(existing -> {
                        throw new BusinessRuleException("CONFLICT",
                                "SKU already exists in this venue: " + request.getSku(), "sku");
                    });
        }

        mapRequestToEntity(request, item);
        InventoryItem saved = inventoryItemRepository.save(item);
        return InventoryItemResponse.fromEntity(saved);
    }

    @Override
    public void deactivate(Long id) {
        InventoryItem item = findByIdOrThrow(id);
        item.setActive(false);
        inventoryItemRepository.save(item);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryItemResponse> listByVenue(Long venueId, Pageable pageable) {
        return inventoryItemRepository.findByVenueIdAndActiveTrue(venueId, pageable)
                .map(InventoryItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryItemResponse> search(Long venueId, String query, Pageable pageable) {
        return inventoryItemRepository.searchByVenueId(venueId, query, pageable)
                .map(InventoryItemResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryItemResponse> getLowStock(Long venueId) {
        return inventoryItemRepository.findLowStockByVenueId(venueId).stream()
                .map(InventoryItemResponse::fromEntity)
                .toList();
    }

    private InventoryItem findByIdOrThrow(Long id) {
        return inventoryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryItem", id));
    }

    private void mapRequestToEntity(InventoryItemRequest request, InventoryItem item) {
        item.setName(request.getName());
        item.setSku(request.getSku());
        item.setDescription(request.getDescription());
        item.setUnit(request.getUnit());
        item.setQuantityOnHand(request.getQuantityOnHand());
        item.setReorderLevel(request.getReorderLevel());
        item.setReorderQuantity(request.getReorderQuantity());
        item.setUnitCost(request.getUnitCost());
        item.setVenueId(request.getVenueId());

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", request.getSupplierId()));
            item.setSupplier(supplier);
        } else {
            item.setSupplier(null);
        }
    }
}
