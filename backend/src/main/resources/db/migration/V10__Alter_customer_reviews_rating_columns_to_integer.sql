-- V10__Alter_customer_reviews_rating_columns_to_integer.sql
-- Aligns DB column types with JPA Integer mappings.

ALTER TABLE customer_reviews
    ALTER COLUMN rating TYPE INTEGER USING rating::INTEGER,
    ALTER COLUMN staff_behavior_rating TYPE INTEGER USING staff_behavior_rating::INTEGER;
