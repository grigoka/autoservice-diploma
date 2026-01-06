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
    gen_random_uuid(),
    'admin@test.com',
    '$2a$10$slYQmyNdGzTn7ZLBXBChFOC9f6kFjAqPhccnP6DxlWXx2lPk1C3G6',
    'OWNER',
    'Admin',
    'System',
    '123456789',
    0,
    NOW(),
    NOW()
);

