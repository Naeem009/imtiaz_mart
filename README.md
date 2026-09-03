# ATVOO

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
- Docker (for PostgreSQL, Redis, and Elasticsearch)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Environment
cp .env.example .env

# 3. Start Docker infrastructure
npm run docker:up

# 4. Initialize the Docker database
npm run db:migrate:deploy
npm run db:seed

# 5. Run apps (separate terminals; they use the Docker services)
npm run dev:web    # http://localhost:3000
npm run dev:api    # http://localhost:3001/api/v1/health
```

Check infrastructure status with `docker compose ps`. Stop the services with
`npm run docker:down`. The database, Redis, and Elasticsearch data persist in
named Docker volumes.

API Swagger UI: http://localhost:3001/api/docs

## Production testing deployment

Vercel deploys the Next.js storefront only. Deploy the API separately using
`apps/api/Dockerfile` on a container host, and use managed PostgreSQL and Redis
for the test environment. Elasticsearch is optional because catalog search
falls back to PostgreSQL.

Release order:

```bash
npm ci
npm run db:migrate:deploy
npm run db:seed
```

Set these variables in the API host:

- `DATABASE_URL`, `REDIS_URL`, and optional `ELASTICSEARCH_URL`
- `APP_URL` and `CORS_ORIGIN` (`CORS_ORIGIN` accepts comma-separated Vercel origins)
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `SOCIAL_ENCRYPTION_KEY` (32+ characters)
- `API_PORT` and `NEXT_PUBLIC_APP_URL` when generating public links

Set these variables in Vercel:

- `NEXT_PUBLIC_API_URL` to the API URL ending in `/api/v1`
- `NEXT_PUBLIC_APP_URL` to the Vercel deployment URL
- `NEXT_PUBLIC_APP_NAME`

Never use the demo seed password in a public environment. Run the seed only for
an isolated testing database, then change or remove the demo accounts.

## Vercel deployment

The Next.js storefront is configured for Vercel via `vercel.json`. The current
configuration assumes the Vercel project Root Directory is `apps`; therefore
the configured `web/.next` output resolves to `apps/web/.next`. Keep that
Root Directory and do not set it to the repository root without also changing
the output path and build configuration.

Set these Vercel environment variables for Preview and Production:

- `NEXT_PUBLIC_APP_URL` — the deployed storefront URL
- `NEXT_PUBLIC_API_URL` — the deployed API URL ending in `/api/v1`
- `NEXT_PUBLIC_APP_NAME` — the public application name

Deploy the NestJS API separately on a service that supports long-running Node
processes. Configure its `DATABASE_URL`, `REDIS_URL`, `ELASTICSEARCH_URL`,
`APP_URL`, `CORS_ORIGIN`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` values there.
The API and its PostgreSQL, Redis, and Elasticsearch services must be reachable
from the deployed API. Do not use the local Docker URLs in production.

The current upload endpoint writes to local disk for development. Before
enabling production uploads, replace it with durable object storage such as
Cloudflare R2 and set its public asset URL; Vercel and most API hosts do not
provide persistent local filesystems.

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

Read the [Developer Handbook](./docs/00_DEVELOPER_HANDBOOK.md) first for the
complete setup, architecture, workflow, testing, deployment, and troubleshooting
guide.

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

See [docs/README.md](./docs/README.md) for the complete documentation index.
