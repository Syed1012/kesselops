package de.kesselops.inventory.controller;

import de.kesselops.inventory.dto.SupplierRequest;
import de.kesselops.inventory.dto.SupplierResponse;
import de.kesselops.inventory.service.SupplierService;
import de.kesselops.shared.dto.ApiResponse;
import de.kesselops.shared.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Supplier operations.
 */
@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> create(
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.create(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Supplier created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) {
        SupplierResponse response = supplierService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse response = supplierService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Supplier updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        supplierService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Supplier deactivated"));
    }

    @GetMapping
    public ResponseEntity<PagedResponse<SupplierResponse>> list(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<SupplierResponse> page;
        if (search != null && !search.isBlank()) {
            page = supplierService.search(search, pageable);
        } else {
            page = supplierService.list(pageable);
        }
        return ResponseEntity.ok(PagedResponse.of(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> listAll() {
        List<SupplierResponse> suppliers = supplierService.listAll();
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }
}
