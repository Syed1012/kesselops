-- Add cart_items table for shared cart functionality

CREATE TABLE guest.cart_items (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES guest.sessions(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL,
    menu_item_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    menu_item_image VARCHAR(500),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast cart retrieval by session
CREATE INDEX idx_cart_items_session ON guest.cart_items(session_id);
