-- V9__Create_customer_reviews_table.sql
-- Stores global customer feedback submitted through the public review QR flow.

CREATE TABLE customer_reviews (
    id BIGSERIAL PRIMARY KEY,
    reviewer_name VARCHAR(120) NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    staff_behavior_rating SMALLINT NOT NULL CHECK (staff_behavior_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    source VARCHAR(20) NOT NULL DEFAULT 'QR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_reviews_created_at ON customer_reviews (created_at DESC);
