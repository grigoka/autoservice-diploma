CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,

    first_name VARCHAR(80) NOT NULL,
    last_name  VARCHAR(80) NOT NULL,
    phone VARCHAR(32),

    address_line1 VARCHAR(150),
    address_line2 VARCHAR(150),
    city VARCHAR(80),
    zip  VARCHAR(16),

    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
CREATE INDEX IF NOT EXISTS ix_users_phone ON users(phone);


CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    make VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    year_of_manufacture INT,
    vin VARCHAR(32) UNIQUE,
    license_plate VARCHAR(16) UNIQUE,

    owner_id UUID NOT NULL REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS ix_vehicles_owner_id ON vehicles(owner_id);

CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    customer_id UUID NOT NULL REFERENCES users(id),
    vehicle_id  UUID NOT NULL REFERENCES vehicles(id),

    status VARCHAR(32) NOT NULL,
    vat_rate NUMERIC(12,2) NOT NULL DEFAULT 0.21
);

CREATE INDEX IF NOT EXISTS ix_work_orders_customer_id ON work_orders(customer_id);
CREATE INDEX IF NOT EXISTS ix_work_orders_vehicle_id  ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS ix_work_orders_status      ON work_orders(status);


CREATE TABLE IF NOT EXISTS work_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    details TEXT,
    quantity INT NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_items_work_order_id ON work_order_items(work_order_id);
