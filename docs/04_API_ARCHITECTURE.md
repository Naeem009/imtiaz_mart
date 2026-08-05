# API ARCHITECTURE

Architecture Style:

REST API

Future Ready:

GraphQL Layer Optional

Versioning:

/api/v1

---

# AUTHENTICATION APIs

/auth/register

/auth/login

/auth/logout

/auth/refresh

/auth/forgot-password

/auth/reset-password

/auth/social-login

---

# CUSTOMER APIs

/customers

/customer/profile

/customer/orders

/customer/wishlist

/customer/addresses

/customer/reviews

/customer/rewards

/customer/support

---

# VENDOR APIs

/vendors

/vendor/profile

/vendor/products

/vendor/orders

/vendor/inventory

/vendor/payouts

/vendor/analytics

/vendor/staff

---

# VENDOR SOCIAL AUTOMATION APIs (Premium Plans)

/vendor/social-accounts

/vendor/social-accounts/connect/:platform

/vendor/social-accounts/disconnect/:platform

/vendor/social-automation/rules

/vendor/social-automation/rules/:id

/vendor/social-automation/queue

/vendor/social-automation/queue/:id/approve

/vendor/social-automation/queue/:id/reject

/vendor/social-automation/generate-post

/vendor/social-automation/analytics

/social/webhooks/:platform

---

# STORE SOCIAL AUTOMATION APIs (Marketplace-owned, Admin/Marketing)

/admin/store-social/accounts

/admin/store-social/accounts/connect/:platform

/admin/store-social/curation-rules

/admin/store-social/queue

/admin/store-social/queue/:id/approve

/admin/store-social/queue/:id/edit

/admin/store-social/queue/:id/reject

/admin/store-social/sponsored-slots

/admin/store-social/fairness-report

/admin/store-social/analytics

/vendor/store-social/opt-in

/vendor/store-social/tag-handle

/vendor/store-social/exclude-product/:productId

/vendor/store-social/performance

---

# AI AGENT COMMERCE APIs (public, machine-readable)

/.well-known/commerce-manifest.json (UCP manifest)

/feeds/ucp (Universal Commerce Protocol product feed)

/feeds/acp (Agentic Commerce Protocol product feed, ChatGPT/Stripe)

/feeds/perplexity (Google-Shopping-format feed for Perplexity Merchant Program)

/llms.txt (brand/catalog guidance for AI crawlers)

/admin/agent-commerce/eligibility

/admin/agent-commerce/feed-status

/analytics/agent-attribution

---

# PRODUCT APIs

/products

/products/search

/products/visual-search

/products/filter

/products/recommendations

/products/compare

/products/reviews

/products/questions

---

# ORDER APIs

/orders

/orders/create

/orders/payment

/orders/track

/orders/return

/orders/refund

---

# CMS APIs

/pages

/blogs

/faqs

/banners

/menus

---

# ADMIN APIs

/admin/vendors

/admin/customers

/admin/orders

/admin/products

/admin/payments

/admin/reports

/admin/settings

---

# API RULES

JSON Responses

Pagination

Sorting

Filtering

Search

Rate Limiting

Swagger Documentation

OpenAPI Compliance

JWT Authentication

Refresh Tokens

OAuth Support

Consistent Error Handling

Subscription Tier Gate Guards (Social Automation & other premium-only routes)

Webhook Signature Verification (per-platform)

Idempotency Keys on Queue/Publish Endpoints
