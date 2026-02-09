-- V1__Initial_schema.sql
-- KesselOps database schema for Auth & Operations modules

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    phone VARCHAR(50),
    venue_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Venues table
CREATE TABLE venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/Berlin',
    owner_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for user venue after venues table exists
ALTER TABLE users ADD CONSTRAINT fk_users_venue FOREIGN KEY (venue_id) REFERENCES venues(id);

-- Shifts table
CREATE TABLE shifts (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    type VARCHAR(20) NOT NULL,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Shift assignments table
CREATE TABLE shift_assignments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    shift_id BIGINT NOT NULL REFERENCES shifts(id),
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by_user_id BIGINT REFERENCES users(id)
);

-- Handovers table
CREATE TABLE handovers (
    id BIGSERIAL PRIMARY KEY,
    from_shift_id BIGINT NOT NULL REFERENCES shifts(id),
    to_shift_id BIGINT REFERENCES shifts(id),
    author_user_id BIGINT NOT NULL REFERENCES users(id),
    summary TEXT NOT NULL,
    open_issues TEXT,
    next_steps TEXT,
    acknowledged_by_user_id BIGINT REFERENCES users(id),
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Checklists table
CREATE TABLE checklists (
    id BIGSERIAL PRIMARY KEY,
    shift_id BIGINT NOT NULL REFERENCES shifts(id),
    category VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task items table
CREATE TABLE task_items (
    id BIGSERIAL PRIMARY KEY,
    checklist_id BIGINT NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_DONE',
    sort_order INTEGER NOT NULL,
    requires_photo BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by_user_id BIGINT REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_venue ON users(venue_id);
CREATE INDEX idx_venues_owner ON venues(owner_id);
CREATE INDEX idx_shifts_venue ON shifts(venue_id);
CREATE INDEX idx_shifts_active ON shifts(venue_id, is_active);
CREATE INDEX idx_assignments_shift ON shift_assignments(shift_id);
CREATE INDEX idx_assignments_user ON shift_assignments(user_id);
CREATE INDEX idx_checklists_shift ON checklists(shift_id);
CREATE INDEX idx_tasks_checklist ON task_items(checklist_id);
