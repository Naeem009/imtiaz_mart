# ATVOO Web Storefront

This package is the Next.js 16 storefront and portal application for ATVOO.
It uses the App Router, React Server Components by default, and shared types
from `@imtiaz-mart/shared`.

## Run locally

Run these commands from the repository root:

```bash
cp .env.example .env
npm ci
npm run dev:web
```

Open `http://localhost:3000`. The API should be running separately with
`npm run dev:api`; set `NEXT_PUBLIC_API_URL` to the API URL ending in
`/api/v1`.

## Build and lint

```bash
npm run build:web
npm run lint --workspace=@imtiaz-mart/web
```

## Structure

| Path | Responsibility |
| --- | --- |
| `app/` | App Router pages, layouts, route groups, and route boundaries |
| `components/` | Reusable storefront, portal, and domain UI |
| `lib/` | API clients, server actions, domain helpers, and SEO utilities |
| `config/` | Site-level configuration |
| `types/` | Web-specific TypeScript types |
| `public/` | Static public assets |

Use Server Components for data loading unless browser state or event handlers
require a Client Component. Keep authorization enforced by the API and do not
put secrets in client code.

For complete architecture, route, workflow, accessibility, testing, and
deployment guidance, read [`docs/00_DEVELOPER_HANDBOOK.md`](../../docs/00_DEVELOPER_HANDBOOK.md).
