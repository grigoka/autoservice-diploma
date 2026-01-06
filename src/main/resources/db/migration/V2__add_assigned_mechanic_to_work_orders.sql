ALTER TABLE work_orders 
ADD COLUMN assigned_mechanic_id UUID NULL REFERENCES users(id);

CREATE INDEX IF NOT EXISTS ix_work_orders_assigned_mechanic_id ON work_orders(assigned_mechanic_id);





