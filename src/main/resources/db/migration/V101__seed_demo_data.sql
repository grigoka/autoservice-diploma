-- Demo data for screenshots (customers, vehicles, work orders in various statuses).
-- Logins (password for all demo users except owner: see below):
--   admin@test.com / admin123          (OWNER)
--   mechanic@test.com / mechanic123    (MECHANIC)
--   anna.novak@test.com / customer123    (CUSTOMER)
--   jan.dvorak@test.com / customer123  (CUSTOMER)
--   marie.svoboda@test.com / customer123 (CUSTOMER)

-- Mechanic
INSERT INTO users (
    id, email, password_hash, role, first_name, last_name, phone,
    version, created_at, updated_at
) VALUES (
    '00000001-0000-0000-0000-000000000010',
    'mechanic@test.com',
    '$2a$10$w357TmkEdvAj5H7uRw4j6.bhOSVIkTToee9i8z4hwJvkkTqqUhbVO',
    'MECHANIC',
    'Petr',
    'Mechanik',
    '+420 777 000 010',
    0, NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Customers
INSERT INTO users (
    id, email, password_hash, role, first_name, last_name, phone,
    address_line1, city, zip,
    version, created_at, updated_at
) VALUES
(
    '00000001-0000-0000-0000-000000000101',
    'anna.novak@test.com',
    '$2a$10$Jrx01iJUGm/hKcWlZU.oZ.TarR9cdmGn8F766IFtictmqmRlc3MoC',
    'CUSTOMER', 'Anna', 'Nováková', '+420 777 000 101',
    'Hlavní 12', 'Praha', '11000',
    0, NOW(), NOW()
),
(
    '00000001-0000-0000-0000-000000000102',
    'jan.dvorak@test.com',
    '$2a$10$Jrx01iJUGm/hKcWlZU.oZ.TarR9cdmGn8F766IFtictmqmRlc3MoC',
    'CUSTOMER', 'Jan', 'Dvořák', '+420 777 000 102',
    'Nádražní 5', 'Brno', '60200',
    0, NOW(), NOW()
),
(
    '00000001-0000-0000-0000-000000000103',
    'marie.svoboda@test.com',
    '$2a$10$Jrx01iJUGm/hKcWlZU.oZ.TarR9cdmGn8F766IFtictmqmRlc3MoC',
    'CUSTOMER', 'Marie', 'Svobodová', '+420 777 000 103',
    'Lesní 8', 'Ostrava', '70200',
    0, NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Vehicles
INSERT INTO vehicles (
    id, make, model, year_of_manufacture, vin, license_plate, owner_id,
    next_inspection_at, version, created_at, updated_at
) VALUES
(
    '00000002-0000-0000-0000-000000000201',
    'Škoda', 'Octavia', 2019, 'TM9AA11BB22CC33001', '1AB2345',
    '00000001-0000-0000-0000-000000000101',
    (CURRENT_DATE + INTERVAL '14 days')::timestamp, 0, NOW(), NOW()
),
(
    '00000002-0000-0000-0000-000000000202',
    'Volkswagen', 'Golf', 2018, 'WVWZZZ1KZ8W386753', '2CD6789',
    '00000001-0000-0000-0000-000000000101',
    (CURRENT_DATE + INTERVAL '45 days')::timestamp, 0, NOW(), NOW()
),
(
    '00000002-0000-0000-0000-000000000203',
    'Toyota', 'Corolla', 2020, 'JTDBR32E720123456', '3EF9012',
    '00000001-0000-0000-0000-000000000102',
    (CURRENT_DATE + INTERVAL '7 days')::timestamp, 0, NOW(), NOW()
),
(
    '00000002-0000-0000-0000-000000000204',
    'Honda', 'Civic', 2017, '19XFC2F59HE123789', '4GH3456',
    '00000001-0000-0000-0000-000000000102',
    (CURRENT_DATE + INTERVAL '90 days')::timestamp, 0, NOW(), NOW()
),
(
    '00000002-0000-0000-0000-000000000205',
    'Audi', 'A4', 2021, 'WAUZZZ8K9KA123456', '5IJ7890',
    '00000001-0000-0000-0000-000000000103',
    (CURRENT_DATE + INTERVAL '21 days')::timestamp, 0, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Work orders (all statuses for dashboard / list screenshots)
INSERT INTO work_orders (
    id, customer_id, vehicle_id, status, vat_rate, assigned_mechanic_id,
    version, created_at, updated_at
) VALUES
(
    '00000003-0000-0000-0000-000000000301',
    '00000001-0000-0000-0000-000000000101',
    '00000002-0000-0000-0000-000000000201',
    'DRAFT', 0.21, NULL,
    0, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
),
(
    '00000003-0000-0000-0000-000000000302',
    '00000001-0000-0000-0000-000000000101',
    '00000002-0000-0000-0000-000000000202',
    'WAITING_FOR_APPROVAL', 0.21,
    '00000001-0000-0000-0000-000000000010',
    0, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
),
(
    '00000003-0000-0000-0000-000000000303',
    '00000001-0000-0000-0000-000000000102',
    '00000002-0000-0000-0000-000000000203',
    'IN_PROGRESS', 0.21,
    '00000001-0000-0000-0000-000000000010',
    0, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '3 hours'
),
(
    '00000003-0000-0000-0000-000000000304',
    '00000001-0000-0000-0000-000000000102',
    '00000002-0000-0000-0000-000000000204',
    'READY', 0.21,
    '00000001-0000-0000-0000-000000000010',
    0, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'
),
(
    '00000003-0000-0000-0000-000000000305',
    '00000001-0000-0000-0000-000000000103',
    '00000002-0000-0000-0000-000000000205',
    'DONE', 0.21,
    '00000001-0000-0000-0000-000000000010',
    0, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
),
(
    '00000003-0000-0000-0000-000000000306',
    '00000001-0000-0000-0000-000000000101',
    '00000002-0000-0000-0000-000000000201',
    'CANCELED', 0.21, NULL,
    0, NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days'
)
ON CONFLICT (id) DO NOTHING;

-- Work order items (for orders that need line items / totals)
INSERT INTO work_order_items (
    id, work_order_id, title, details, quantity, unit_price,
    version, created_at, updated_at
) VALUES
-- Waiting for approval
(
    '00000004-0000-0000-0000-000000000401',
    '00000003-0000-0000-0000-000000000302',
    'Oil change', 'Synthetic oil 5W-30 and filter', 1, 1890.00,
    0, NOW(), NOW()
),
(
    '00000004-0000-0000-0000-000000000402',
    '00000003-0000-0000-0000-000000000302',
    'Brake inspection', 'Front and rear pads check', 1, 650.00,
    0, NOW(), NOW()
),
-- In progress
(
    '00000004-0000-0000-0000-000000000403',
    '00000003-0000-0000-0000-000000000303',
    'Timing belt replacement', 'Kit + labor', 1, 8500.00,
    0, NOW(), NOW()
),
(
    '00000004-0000-0000-0000-000000000404',
    '00000003-0000-0000-0000-000000000303',
    'Coolant flush', NULL, 1, 1200.00,
    0, NOW(), NOW()
),
-- Ready
(
    '00000004-0000-0000-0000-000000000405',
    '00000003-0000-0000-0000-000000000304',
    'Summer tire change', '4 tires mounted and balanced', 1, 2400.00,
    0, NOW(), NOW()
),
-- Done
(
    '00000004-0000-0000-0000-000000000406',
    '00000003-0000-0000-0000-000000000305',
    'Annual service', 'Full inspection package', 1, 4200.00,
    0, NOW(), NOW()
),
(
    '00000004-0000-0000-0000-000000000407',
    '00000003-0000-0000-0000-000000000305',
    'Air filter', NULL, 2, 350.00,
    0, NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;
