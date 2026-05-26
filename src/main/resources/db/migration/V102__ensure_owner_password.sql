-- Ensure owner password is admin123 (for DBs created before V99 update).
UPDATE users
SET password_hash = '$2a$10$MlKRH3Zo9UWmG9xANPZO4uprXGADaWkzdocjHWQIjj/TgpealEU2G',
    updated_at = NOW()
WHERE email = 'admin@test.com';
