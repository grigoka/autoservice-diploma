-- Owner account for local dev and screenshots: admin@test.com / admin123
INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    first_name,
    last_name,
    phone,
    version,
    created_at,
    updated_at
) VALUES (
    '00000001-0000-0000-0000-000000000001',
    'admin@test.com',
    '$2a$10$MlKRH3Zo9UWmG9xANPZO4uprXGADaWkzdocjHWQIjj/TgpealEU2G',
    'OWNER',
    'Admin',
    'System',
    '+420 777 000 001',
    0,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();
