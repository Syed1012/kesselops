package de.kesselops.inventory.service;

import de.kesselops.inventory.dto.*;
import de.kesselops.inventory.model.InventoryItem;
import de.kesselops.inventory.model.PurchaseOrder;
import de.kesselops.inventory.model.PurchaseOrderLine;
import de.kesselops.inventory.model.Supplier;
import de.kesselops.inventory.repository.PurchaseOrderRepository;
import de.kesselops.shared.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of PurchaseOrderService.
 */
@Service
@Transactional
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final EntityManager entityManager;

    public PurchaseOrderServiceImpl(PurchaseOrderRepository purchaseOrderRepository,
            EntityManager entityManager) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.entityManager = entityManager;
    }

    @Override
    public PurchaseOrderResponse create(PurchaseOrderRequest request) {
        PurchaseOrder order = new PurchaseOrder();
        order.setVenueId(request.getVenueId());
        order.setNotes(request.getNotes());
        order.setStatus(PurchaseOrder.Status.DRAFT);

        // Set supplier if provided
        if (request.getSupplierId() != null) {
            Supplier supplier = entityManager.find(Supplier.class, request.getSupplierId());
            if (supplier == null) {
                throw new ResourceNotFoundException("Supplier", request.getSupplierId());
            }
            order.setSupplier(supplier);
        }

        // Add line items and update inventory
        for (PurchaseOrderLineRequest lineRequest : request.getLines()) {
            InventoryItem item = entityManager.find(InventoryItem.class, lineRequest.getInventoryItemId());
            if (item == null) {
                throw new ResourceNotFoundException("InventoryItem", lineRequest.getInventoryItemId());
            }

            PurchaseOrderLine line = new PurchaseOrderLine();
            line.setInventoryItem(item);
            line.setQuantity(lineRequest.getQuantity());

            // Use provided unit cost or fall back to item's unit cost
            BigDecimal unitCost = lineRequest.getUnitCost() != null
                    ? lineRequest.getUnitCost()
                    : (item.getUnitCost() != null ? item.getUnitCost() : BigDecimal.ZERO);
            line.setUnitCost(unitCost);
            line.recalculateLineTotal();

            order.addLine(line);

            // Update inventory: increase stock by ordered quantity
            item.setQuantityOnHand(item.getQuantityOnHand().add(lineRequest.getQuantity()));
            entityManager.merge(item);
        }

        order.recalculateTotal();
        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> listByVenue(Long venueId, Pageable pageable) {
        return purchaseOrderRepository.findByVenueIdOrderByCreatedAtDesc(venueId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrderResponse> listByVenueAndStatus(Long venueId, PurchaseOrder.Status status,
            Pageable pageable) {
        return purchaseOrderRepository.findByVenueIdAndStatusOrderByCreatedAtDesc(venueId, status, pageable)
                .map(this::toResponse);
    }

    @Override
    public PurchaseOrderResponse updateStatus(Long id, PurchaseOrder.Status status) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
        order.setStatus(status);
        PurchaseOrder saved = purchaseOrderRepository.save(order);
        return toResponse(saved);
    }

    @Override
    public void cancel(Long id) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", id));
        order.setStatus(PurchaseOrder.Status.CANCELLED);
        purchaseOrderRepository.save(order);
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder order) {
        PurchaseOrderResponse response = new PurchaseOrderResponse();
        response.setId(order.getId());
        response.setVenueId(order.getVenueId());
        response.setStatus(order.getStatus());
        response.setNotes(order.getNotes());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        if (order.getSupplier() != null) {
            response.setSupplierId(order.getSupplier().getId());
            response.setSupplierName(order.getSupplier().getName());
        }

        List<PurchaseOrderLineResponse> lineResponses = order.getLines().stream()
                .map(this::toLineResponse)
                .collect(Collectors.toList());
        response.setLines(lineResponses);

        return response;
    }

    private PurchaseOrderLineResponse toLineResponse(PurchaseOrderLine line) {
        PurchaseOrderLineResponse response = new PurchaseOrderLineResponse();
        response.setId(line.getId());
        response.setQuantity(line.getQuantity());
        response.setUnitCost(line.getUnitCost());
        response.setLineTotal(line.getLineTotal());

        InventoryItem item = line.getInventoryItem();
        if (item != null) {
            response.setInventoryItemId(item.getId());
            response.setInventoryItemName(item.getName());
            response.setInventoryItemSku(item.getSku());
            response.setUnit(item.getUnit());
        }

        return response;
    }
}
