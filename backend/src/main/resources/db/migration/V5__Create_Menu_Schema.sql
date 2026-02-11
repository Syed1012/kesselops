-- V5__Create_Menu_Schema.sql
-- Menu module: Menu Items, Recipes, Menus, Syndications

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
    image_url VARCHAR(500), -- Added in V10 originally
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

-- Menus table
CREATE TABLE menus (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    type VARCHAR(30) NOT NULL,
    venue_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menus_venue ON menus(venue_id);
CREATE INDEX idx_menus_type ON menus(type);
CREATE INDEX idx_menus_active ON menus(active);

-- Menu to MenuItem junction table (many-to-many)
CREATE TABLE menu_menu_items (
    menu_id BIGINT NOT NULL,
    menu_item_id BIGINT NOT NULL,
    
    PRIMARY KEY (menu_id, menu_item_id),
    
    CONSTRAINT fk_menu_menu_items_menu 
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_menu_items_item 
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_menu_menu_items_menu ON menu_menu_items(menu_id);
CREATE INDEX idx_menu_menu_items_item ON menu_menu_items(menu_item_id);

-- Menu syndications table
CREATE TABLE menu_syndications (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    target VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    external_id VARCHAR(255),
    external_url VARCHAR(500),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_error VARCHAR(1000),
    config_json VARCHAR(2000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_menu_syndications_menu 
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    CONSTRAINT uk_menu_syndication_target 
        UNIQUE (menu_id, target)
);

CREATE INDEX idx_menu_syndications_menu ON menu_syndications(menu_id);
CREATE INDEX idx_menu_syndications_target ON menu_syndications(target);
CREATE INDEX idx_menu_syndications_status ON menu_syndications(status);
