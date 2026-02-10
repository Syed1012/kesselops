-- V3: Create recipe and stock tracking tables
-- Part of Phase 2: Recipes & Stock Tracking

-- Menu items table
CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    category VARCHAR(30) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) DEFAULT 0,
    venue_id BIGINT NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_venue ON menu_items(venue_id);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);

-- Recipes table (1:1 with menu_items)
CREATE TABLE recipes (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT NOT NULL UNIQUE,
    instructions TEXT,
    prep_time_minutes INTEGER,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_recipes_menu_item 
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipes_menu_item ON recipes(menu_item_id);

-- Recipe ingredients table (many-to-many bridge)
CREATE TABLE recipe_ingredients (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    inventory_item_id BIGINT NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    unit VARCHAR(30),
    notes VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_recipe_ingredients_recipe 
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_ingredients_inventory_item 
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_item ON recipe_ingredients(inventory_item_id);

-- Stock logs table (audit trail)
CREATE TABLE stock_logs (
    id BIGSERIAL PRIMARY KEY,
    inventory_item_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL,
    quantity_before DECIMAL(10, 4),
    quantity_after DECIMAL(10, 4),
    reason VARCHAR(500),
    reference_type VARCHAR(50),
    reference_id BIGINT,
    performed_by BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_stock_logs_inventory_item 
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id)
);

CREATE INDEX idx_stock_logs_item ON stock_logs(inventory_item_id);
CREATE INDEX idx_stock_logs_type ON stock_logs(type);
CREATE INDEX idx_stock_logs_created ON stock_logs(created_at);
CREATE INDEX idx_stock_logs_reference ON stock_logs(reference_type, reference_id);
