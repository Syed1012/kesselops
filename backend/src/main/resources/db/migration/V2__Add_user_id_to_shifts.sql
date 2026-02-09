-- Add user_id column to shifts table for per-user shift assignment
ALTER TABLE shifts ADD COLUMN user_id BIGINT;
