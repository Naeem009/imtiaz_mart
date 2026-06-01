# Imtiaz Mart

Enterprise multi-vendor marketplace platform.

## Monorepo structure

```
imtiaz_mart/
├── apps/
│   ├── web/          # Next.js 16 — public storefront (App Router)
│   └── api/          # NestJS 11 — REST API /api/v1
├── packages/
│   ├── database/     # Prisma + PostgreSQL
│   └── shared/       # Shared types & constants
├── docs/             # Project specifications (source of truth)
└── docker-compose.yml
```

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL & Redis)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Environment
cp .env.example .env

# 3. Start infrastructure
npm run docker:up

# 4. Database (requires Docker / PostgreSQL running)
npm run docker:up
npm run db:migrate
npm run db:seed

# 5. Run apps (separate terminals)
npm run dev:web    # http://localhost:3000
npm run dev:api    # http://localhost:3001/api/v1/health
```

API Swagger UI: http://localhost:3001/api/docs

## Catalog routes (web)

| Route | Description |
|-------|-------------|
| `/shop` | All products with filters |
| `/categories` | Category directory |
| `/categories/[slug]` | Products in category |
| `/products/[slug]` | Product detail |
| `/search?q=` | Search results |
| `/brands` | Brand directory |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (sign-in required) |
| `/orders/[orderNumber]` | Order confirmation |
| `/account/orders` | Order history |

## Cart & checkout API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /cart` | Optional | Get cart (`X-Cart-Session` header for guests) |
| `POST /cart/items` | Optional | Add item |
| `PATCH /cart/items/:id` | Optional | Update quantity |
| `DELETE /cart/items/:id` | Optional | Remove item |
| `POST /orders/create` | Required | Place order from cart |
| `GET /orders` | Required | List my orders |
| `GET /orders/track/:orderNumber` | Required | Order details |

## Specifications

Always read before implementing features:

- [docs/01_PROJECT_MASTER_SPECIFICATION.md](./docs/01_PROJECT_MASTER_SPECIFICATION.md)
- [docs/02_DATABASE_ARCHITECTURE.md](./docs/02_DATABASE_ARCHITECTURE.md)
- [docs/03_UI_UX_DESIGN_SYSTEM.md](./docs/03_UI_UX_DESIGN_SYSTEM.md)
- [docs/04_API_ARCHITECTURE.md](./docs/04_API_ARCHITECTURE.md)
- [docs/05_DEVELOPMENT_STANDARDS.md](./docs/05_DEVELOPMENT_STANDARDS.md)

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | NestJS 11, REST `/api/v1` |
| Database | PostgreSQL 17, Prisma |
| Cache | Redis |
| Search | Elasticsearch (planned) |
| Storage | Cloudflare R2 (planned) |
