-- Guest module database schema
-- Flyway migration V1

CREATE SCHEMA IF NOT EXISTS guest;

-- Guest profiles
CREATE TABLE guest.guests (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tables in a venue
CREATE TABLE guest.tables (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Reservations
CREATE TABLE guest.reservations (
    id BIGSERIAL PRIMARY KEY,
    guest_id BIGINT REFERENCES guest.guests(id),
    venue_id BIGINT NOT NULL,
    party_size INTEGER NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table sessions (started via QR scan)
CREATE TABLE guest.sessions (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES guest.tables(id),
    venue_id BIGINT NOT NULL,
    reservation_id BIGINT REFERENCES guest.reservations(id),
    assigned_staff_id BIGINT,
    verified_by_staff_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP
);

-- Orders within a session
CREATE TABLE guest.orders (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES guest.sessions(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Order line items
CREATE TABLE guest.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES guest.orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL
);

-- Payments against a session
CREATE TABLE guest.payments (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES guest.sessions(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    collected_by_staff_id BIGINT,
    paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_reservations_venue_time ON guest.reservations(venue_id, reservation_time);
CREATE INDEX idx_sessions_table_status ON guest.sessions(table_id, status);
CREATE INDEX idx_orders_session ON guest.orders(session_id);
CREATE INDEX idx_payments_session ON guest.payments(session_id);
