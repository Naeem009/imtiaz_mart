# Imtiaz Mart — Agent instructions

## Before writing code

Read the relevant specification in `/docs`:

- `01_PROJECT_MASTER_SPECIFICATION.md`
- `02_DATABASE_ARCHITECTURE.md`
- `03_UI_UX_DESIGN_SYSTEM.md`
- `04_API_ARCHITECTURE.md`
- `05_DEVELOPMENT_STANDARDS.md`

Also follow `.cursor/rules/project-rules.mdc`.

## Monorepo layout

- `apps/web` — Next.js storefront (Server Components first)
- `apps/api` — NestJS REST API at `/api/v1`
- `packages/database` — Prisma schema & client
- `packages/shared` — Shared types and constants

## Next.js 16

This project uses Next.js 16 with breaking changes. Read guides in `node_modules/next/dist/docs/` when unsure.

Never make architectural decisions that conflict with the specification documents.
