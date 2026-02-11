-- V3__Create_Tasks_Table.sql
-- Standalone tasks table for Kanban board (separate from checklist task_items)

CREATE TABLE tasks (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(500)    NOT NULL,
    description     TEXT,
    priority        VARCHAR(20)     NOT NULL DEFAULT 'MEDIUM',
    status          VARCHAR(20)     NOT NULL DEFAULT 'TODO',
    category        VARCHAR(30)     NOT NULL DEFAULT 'CUSTOM',
    requires_photo  BOOLEAN         NOT NULL DEFAULT false,
    photo_url       VARCHAR(1000),
    assignee_id     BIGINT          REFERENCES users(id),
    due_date        DATE,
    venue_id        BIGINT          NOT NULL REFERENCES venues(id),
    created_by_user_id BIGINT       NOT NULL REFERENCES users(id),
    created_from_template VARCHAR(50),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_venue      ON tasks(venue_id);
CREATE INDEX idx_tasks_status     ON tasks(venue_id, status);
CREATE INDEX idx_tasks_assignee   ON tasks(assignee_id);
CREATE INDEX idx_tasks_category   ON tasks(venue_id, category);
