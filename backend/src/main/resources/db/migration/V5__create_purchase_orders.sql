-- V5: Create purchase order tables
-- Adds purchase order management for inventory restocking

-- Purchase orders table
CREATE TABLE purchase_orders (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL,
    supplier_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    notes VARCHAR(1000),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_purchase_orders_supplier 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

CREATE INDEX idx_purchase_orders_venue ON purchase_orders(venue_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);

-- Purchase order lines table
CREATE TABLE purchase_order_lines (
    id BIGSERIAL PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    line_total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_po_lines_order 
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_po_lines_item 
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

CREATE INDEX idx_po_lines_order ON purchase_order_lines(purchase_order_id);
CREATE INDEX idx_po_lines_item ON purchase_order_lines(inventory_item_id);
