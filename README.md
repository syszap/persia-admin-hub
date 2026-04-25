# Persia Admin Hub — Production-Ready SaaS Admin Platform

A full-stack, Dockerized SaaS admin platform built with React (Vite + TypeScript) on the frontend and Node.js/Express on the backend, featuring JWT authentication, RBAC, financial double-entry accounting, product/order management, and real-time audit logging.

---

## 🏗️ Architecture

```
persia-admin-hub/
├── src/                          # React frontend (Vite + TypeScript)
│   ├── features/
│   │   ├── auth/                 # JWT auth + RBAC store
│   │   ├── dashboard/            # Home dashboard with live stats
│   │   ├── financial/            # Accounts, transactions, ledger
│   │   ├── products/             # Products, categories, inventory
│   │   ├── orders/               # Orders, customers
│   │   ├── users/                # User management
│   │   ├── roles/                # Roles & permissions
│   │   ├── audit/                # Audit log viewer
│   │   └── returned-cheques/     # Cheque tracking module
│   ├── shared/                   # Layout, error boundary, offline fallback
│   └── services/api/             # Axios client with token refresh
├── server/                       # Express backend (TypeScript)
│   ├── config/                   # App, Redis configuration
│   ├── middlewares/              # Auth, RBAC, logger, rate limiter, error handler
│   ├── modules/
│   │   ├── auth/                 # Login, refresh, logout
│   │   ├── financial/            # Chart of accounts, journal, ledger
│   │   ├── products/             # Product catalog, inventory
│   │   ├── orders/               # Orders, customers
│   │   ├── users/                # User management
│   │   └── audit/                # Audit log API
│   ├── schema/                   # PostgreSQL schema initialization
│   └── utils/                    # Response helpers, Zod validators
└── packages/shared/              # Shared TypeScript types (frontend + backend)
```

---

## 🚀 Quick Start (Docker)

### Prerequisites

- Docker Engine 24+
- Docker Compose V2

### 1. Clone and configure

```bash
git clone https://github.com/syszap/persia-admin-hub
cd persia-admin-hub
```

Edit `.env.docker` and change all `CHANGE_ME_*` values:

```env
POSTGRES_PASSWORD=your_strong_password
JWT_SECRET=your_32+_char_random_secret
JWT_REFRESH_SECRET=your_other_32+_char_secret
REDIS_PASSWORD=your_redis_password
```

### 2. Build and start

```bash
docker-compose up --build
```

### 3. Access the application

| Service    | URL                         |
|------------|-----------------------------|
| Frontend   | http://localhost            |
| API        | http://localhost:3001       |
| Health     | http://localhost:3001/health|

### Default credentials

| Username | Password   | Role  |
|----------|------------|-------|
| admin    | Admin@1234 | owner |

> ⚠️ Change the default password immediately after first login.

---

## 💻 Local Development

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your local PostgreSQL and Redis settings
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

The frontend dev server runs on `http://localhost:8080` and proxies `/api` to `http://localhost:3001`.

---

## 🔐 Authentication & RBAC

### Roles

| Role              | Description        | Access Level       |
|-------------------|--------------------|---------------------|
| `owner`           | System owner       | Full access         |
| `admin`           | Administrator      | Almost full         |
| `finance_manager` | Financial team     | Financial + reports |
| `product_manager` | Product team       | Products + orders   |
| `user`            | Standard user      | Read-only           |
| `customer`        | External customer  | Orders + products   |

### Auth Flow

1. `POST /api/auth/login` → returns `{ token, refreshToken, user }`
2. Access token expires in **15 minutes** (configurable)
3. Automatic silent refresh via interceptor on 401
4. `POST /api/auth/refresh` with `refreshToken` → new token pair
5. `POST /api/auth/logout` → invalidates refresh token

### JWT Security

- Access token: **in-memory only** (never persisted to localStorage)
- Refresh token: stored as **SHA-256 hash** in PostgreSQL
- Rotating refresh tokens (each use issues a new pair)

---

## 💰 Financial Module (Double-Entry Accounting)

| Feature         | Description                                      |
|-----------------|--------------------------------------------------|
| Chart of Accounts | Asset, Liability, Equity, Revenue, Expense     |
| Journal Entries | Draft → Posted → Void workflow                   |
| Ledger          | Per-account history with running balance         |
| Trial Balance   | Full account balance report                      |

All transactions enforce the **double-entry principle** (debits must equal credits).

---

## 📦 Product & Order Module

- Categories with hierarchical support
- Product catalog with inventory tracking
- Low-stock alerts
- Customer management with credit limits
- Order lifecycle: Pending → Confirmed → Processing → Shipped → Delivered

---

## 📊 API Reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Path           | Auth | Description     |
|--------|----------------|------|-----------------|
| POST   | /auth/login    | No   | Login           |
| POST   | /auth/refresh  | No   | Refresh tokens  |
| POST   | /auth/logout   | No   | Logout          |
| GET    | /auth/me       | Yes  | Current user    |

### Users

| Method | Path       | Permission  |
|--------|------------|-------------|
| GET    | /users     | user.view   |
| POST   | /users     | user.create |
| PATCH  | /users/:id | user.update |
| DELETE | /users/:id | user.delete |

### Financial

| Method | Path                              | Permission         |
|--------|-----------------------------------|--------------------|
| GET    | /financial/accounts               | account.view       |
| POST   | /financial/accounts               | account.create     |
| GET    | /financial/accounts/trial-balance | financial.view     |
| GET    | /financial/accounts/:id/ledger    | financial.view     |
| GET    | /financial/transactions           | financial.view     |
| POST   | /financial/transactions           | financial.create   |
| POST   | /financial/transactions/:id/post  | financial.approve  |
| POST   | /financial/transactions/:id/void  | financial.approve  |

### Products & Orders

| Method | Path                         | Permission      |
|--------|------------------------------|-----------------|
| GET    | /products                    | product.view    |
| POST   | /products                    | product.create  |
| GET    | /products/low-stock          | product.view    |
| GET    | /products/categories         | product.view    |
| POST   | /products/inventory/movement | product.update  |
| GET    | /orders                      | order.view      |
| POST   | /orders                      | order.create    |
| GET    | /orders/customers            | customer.view   |
| POST   | /orders/customers            | customer.create |

---

## 🌐 Environment Variables

### Required

| Variable             | Description                         |
|----------------------|-------------------------------------|
| `PG_HOST`            | PostgreSQL host                     |
| `PG_DATABASE`        | Database name                       |
| `PG_USER`            | Database user                       |
| `PG_PASSWORD`        | Database password                   |
| `JWT_SECRET`         | Access token secret (32+ chars)     |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars)    |

### Optional

| Variable              | Default     | Description                 |
|-----------------------|-------------|-----------------------------|
| `PORT`                | `3001`      | Server port                 |
| `REDIS_HOST`          | `localhost` | Redis host                  |
| `REDIS_PORT`          | `6379`      | Redis port                  |
| `REDIS_PASSWORD`      | -           | Redis auth password         |
| `JWT_ACCESS_EXPIRES`  | `15m`       | Access token TTL            |
| `JWT_REFRESH_EXPIRES` | `7d`        | Refresh token TTL           |
| `RATE_LIMIT_MAX`      | `100`       | Requests per 15-min window  |
| `RATE_LIMIT_AUTH_MAX` | `10`        | Login attempts per 15 min   |
| `MULTI_TENANT`        | `false`     | Enable multi-tenancy        |
| `SQL_SERVER_CONN`     | -           | SQL Server connection string|

---

## 📱 PWA Support

- Service worker with offline caching (Workbox)
- Cache-first for static assets, network-first for API calls
- RTL (right-to-left) Persian language support
- Installable on desktop and mobile

---

## 🧪 Testing

```bash
# Frontend tests (Vitest)
npm test

# Backend tests (Jest)
cd server && npm test
```

---

## 🔒 Production Security Checklist

- [ ] Change all `CHANGE_ME_*` values in `.env.docker`
- [ ] Set `JWT_SECRET` to 64+ random characters
- [ ] Enable HTTPS with a reverse proxy (nginx, Caddy, Traefik)
- [ ] Configure firewall to block direct access to ports 3001 and 5432
- [ ] Restrict `FRONTEND_URL` to your domain

---

## 🧩 Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18, Vite, TypeScript, Tailwind |
| UI Library  | shadcn/ui, Radix UI, Recharts        |
| State       | Zustand, TanStack Query              |
| Forms       | React Hook Form + Zod                |
| Backend     | Node.js, Express, TypeScript         |
| Validation  | Zod                                  |
| Database    | PostgreSQL 16                        |
| Cache       | Redis 7                              |
| Auth        | JWT (access + refresh tokens)        |
| Logging     | Pino + pino-http                     |
| Docker      | Multi-stage builds, Docker Compose V2|
| PWA         | Vite PWA Plugin + Workbox            |
