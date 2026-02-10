ALTER TABLE guest.reservations
ADD COLUMN guest_name VARCHAR(100),
ADD COLUMN guest_email VARCHAR(100),
ADD COLUMN guest_phone VARCHAR(20),
ADD COLUMN table_id BIGINT;
