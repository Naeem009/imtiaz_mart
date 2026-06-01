# DEVELOPMENT STANDARDS

Language:

TypeScript Strict Mode

---

# ARCHITECTURE

Clean Architecture

Domain Driven Design

SOLID Principles

Repository Pattern

Dependency Injection

Modular Structure

Feature-Based Organization

---

# CODE STANDARDS

Naming:

camelCase

PascalCase

snake_case (Database Only)

---

# FRONTEND STANDARDS

Next.js App Router

Server Components First

Client Components Only When Required

SEO Optimized

Accessibility First

Responsive First

---

# BACKEND STANDARDS

NestJS Modules

Controllers

Services

Repositories

DTO Validation

Exception Filters

Interceptors

Guards

---

# DATABASE STANDARDS

Prisma ORM

Migration Driven Development

Foreign Keys

Indexes

Soft Deletes

Audit Columns

---

# TESTING

Unit Tests

Integration Tests

E2E Tests

Minimum Coverage: 80%

---

# QUALITY TOOLS

ESLint

Prettier

Husky

Lint-Staged

Commitlint

---

# SECURITY

JWT

RBAC

2FA Ready

CSRF Protection

XSS Protection

SQL Injection Protection

Audit Logging

---

# PERFORMANCE

SSR

ISR

Redis Cache

CDN

Image Optimization

Lazy Loading

Core Web Vitals Optimization

---

# DEVOPS

Docker

Kubernetes Ready

GitHub Actions

Cloudflare CDN

Sentry

Grafana

Prometheus

Automated Backups

---

# CURSOR RULE

Always read:

01_PROJECT_MASTER_SPECIFICATION.md

02_DATABASE_ARCHITECTURE.md

03_UI_UX_DESIGN_SYSTEM.md

04_API_ARCHITECTURE.md

05_DEVELOPMENT_STANDARDS.md

before generating code.

These files are the source of truth.

Never make architectural assumptions that conflict with the specifications.

Generate production-ready enterprise-grade code only.
