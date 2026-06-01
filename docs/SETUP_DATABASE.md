# Database setup

PostgreSQL and Redis run via Docker Compose.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

## Commands

```bash
cp .env.example .env
npm run docker:up
npm run db:migrate
npm run db:seed
```

`db:seed` creates default RBAC roles: `customer`, `vendor`, `admin`, `super_admin`, and others.

## Without Docker

Point `DATABASE_URL` in `.env` to any PostgreSQL 17+ instance, then run migrate and seed.
