# SpendWise — Personal Spending Tracker

A responsive multi-user personal finance tracker built with React, Vite, Tailwind CSS v4, Oxlint, Express, and PostgreSQL.

## Features
- User registration and login (bcrypt password hashing + JWT)
- User-scoped transactions: create, read, update, delete
- Monthly dashboard totals and spending trend
- Monthly budget per account
- Category spending report
- Responsive sidebar, tables, charts, and mobile layout
- Google Fonts: DM Sans + Manrope (not Inter)

## Requirements
- Node.js 20.19+ recommended
- PostgreSQL 14+

## 1. Install dependencies
```bash
npm install
```

## 2. Configure PostgreSQL
Create a database named `spendwise`, then run `backend/schema.sql` against it.

Example using psql:
```bash
createdb spendwise
psql -d spendwise -f backend/schema.sql
```

## 3. Configure environment
Copy `backend/.env.example` to `backend/.env`, then update `DATABASE_URL` and `JWT_SECRET`.

Windows PowerShell:
```powershell
Copy-Item backend/.env.example backend/.env
```

Example:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/spendwise
JWT_SECRET=use-a-long-random-secret-value
CLIENT_URL=http://localhost:5173
```

## 4. Start frontend and backend
```bash
npm run dev
```
- React: http://localhost:5173
- API health check: http://localhost:5000/api/health

You can also run separately:
```bash
npm run dev:client
npm run dev:server
```

## 5. Quality checks
```bash
npm run lint
npm run build
```

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard?month=YYYY-MM`
- `GET /api/transactions?month=YYYY-MM`
- `POST /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`
- `GET /api/budgets/:month`
- `PUT /api/budgets/:month`

All transaction, dashboard, and budget endpoints require `Authorization: Bearer <token>`.
Every database query is scoped to the authenticated user's ID.

## Notes
- This is a development starter, not a production-hardened financial service.
- For production, use HTTPS, a strong secret manager, rate limiting, secure HttpOnly cookie sessions, CSRF protection where applicable, database backups, and deployment-specific CORS/SSL settings.
- JWT is stored in localStorage in this starter for straightforward local development. Consider HttpOnly cookies for production.
