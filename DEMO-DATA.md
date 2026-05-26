# Demo data (screenshots / local dev)

After `docker compose up -d db` and starting the backend, Flyway loads seed data.

## Reset database (recommended before first seed)

```powershell
docker compose down -v
docker compose up -d db
.\mvnw spring-boot:run
```

## Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | admin@test.com | admin123 |
| Mechanic | mechanic@test.com | mechanic123 |
| Customer | anna.novak@test.com | customer123 |
| Customer | jan.dvorak@test.com | customer123 |
| Customer | marie.svoboda@test.com | customer123 |

## What is seeded

- 3 customers with addresses
- 5 vehicles (with upcoming inspection dates)
- 30 work orders (6 base + 24 extra) for pagination demos
- Statuses include DRAFT, WAITING_FOR_APPROVAL, IN_PROGRESS, READY, DONE, CANCELED
- Line items on active/completed orders
- Mechanic **Petr Mechanik** assigned where relevant

Login as **admin@test.com** to see the owner dashboard, customers, vehicles, and orders.
