
-- Seeding data for Tables
-- Venue ID 1 (Midnight Lounge)

INSERT INTO guest.tables (venue_id, table_number, capacity, is_active) VALUES
(1, 'T1', 2, TRUE),
(1, 'T2', 2, TRUE),
(1, 'T3', 4, TRUE),
(1, 'T4', 4, TRUE),
(1, 'T5', 6, TRUE),
(1, 'T6', 6, TRUE),
(1, 'T7', 8, FALSE), -- Maintenance
(1, 'BAR-1', 1, TRUE),
(1, 'BAR-2', 1, TRUE),
(1, 'BAR-3', 1, TRUE),
(1, 'BAR-4', 1, TRUE),
(1, 'VIP-1', 10, TRUE),
(1, 'VIP-2', 12, TRUE);
