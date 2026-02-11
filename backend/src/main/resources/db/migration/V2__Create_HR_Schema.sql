-- V2__Create_HR_Schema.sql
-- HR & Operations module: Shifts, Assignments, Checklists, Handovers

-- Shifts table
CREATE TABLE shifts (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT NOT NULL REFERENCES venues(id),
    user_id BIGINT, -- Added in V13 originally
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

-- Task items table (for checklists)
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

-- Indexes
CREATE INDEX idx_shifts_venue ON shifts(venue_id);
CREATE INDEX idx_shifts_active ON shifts(venue_id, is_active);
CREATE INDEX idx_assignments_shift ON shift_assignments(shift_id);
CREATE INDEX idx_assignments_user ON shift_assignments(user_id);
CREATE INDEX idx_checklists_shift ON checklists(shift_id);
CREATE INDEX idx_tasks_checklist ON task_items(checklist_id);
