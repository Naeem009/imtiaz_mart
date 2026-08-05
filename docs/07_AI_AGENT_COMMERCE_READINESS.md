# AI AGENT COMMERCE READINESS & VISUAL SEARCH

Companion spec to 01–06. Read alongside them before generating code for this module.

This spec covers two related but separate capabilities:

**Part 1 — AI Agent Commerce Readiness:** making ATVOO's catalog discoverable and transactable by AI shopping agents (ChatGPT, Perplexity, Gemini, Microsoft Copilot).

**Part 2 — Visual Search:** letting a customer upload/photograph an item and find matching products, primarily for mobile.

---

# PART 1 — AI AGENT COMMERCE READINESS

## 1.1 Why This Is Now Table Stakes, Not Optional

AI shopping agents query structured product data directly — they do not browse pages or click carousels. As of 2026, three protocols matter:

**Google's Universal Commerce Protocol (UCP)** — launched publicly in January 2026 with Shopify, Walmart, Target, Etsy and others as founding partners. An open, intent-based protocol; one correct UCP manifest can serve Google AI Mode, Gemini, and Microsoft Copilot's UCP path.

**OpenAI's Agentic Commerce Protocol (ACP)** — powers ChatGPT's Instant Checkout, built on Stripe as the payment rail. A separate feed/eligibility format from UCP, though a correctly structured Google Merchant Center feed is also a known input into ChatGPT's shopping results.

**Perplexity Merchant Program** — accepts Google-Shopping-format feeds; supports "Buy with Pro" in-platform checkout via PayPal/Venmo, merchant stays merchant-of-record.

These protocols are additive, not mutually exclusive — a vendor/product can be eligible across all three simultaneously if the underlying product data is clean and complete. ATVOO's approach: **fix product-data hygiene once, generate protocol-specific feeds from that single clean source**, rather than treating each AI surface as a separate integration project.

## 1.2 What "Discoverable" Actually Requires

Schema.org `Product` and `Offer` structured data on every public product page (name, price, availability, GTIN/SKU, brand, images, reviews) — this benefits classic SEO, Google Shopping, and every AI agent simultaneously, so it is the foundation, not an extra.

A machine-readable **merchant manifest** hosted at a standardized path (`/.well-known/commerce-manifest.json`) declaring store identity, categories, policies, and feed locations — this is the UCP equivalent of `robots.txt` for commerce agents.

An **`llms.txt`** file at the domain root giving AI crawlers plain-language guidance about the brand, catalog scope, and how to interpret ATVOO's data — the emerging convention for AI-agent-facing context, separate from human SEO copy.

Structured, machine-consumable **shipping data** per product/vendor (country:region:service:price:min_handling:max_handling:min_transit:max_transit) — agents need this to answer "can I get it by Friday" without a human reading a policy page.

Per-product eligibility flags — `is_eligible_search` and `is_eligible_checkout` — so a vendor or admin can include a product in agent *discovery* while excluding it from agent *autonomous checkout* (useful for regulated categories, made-to-order items, or anything requiring human judgment before purchase).

## 1.3 Feed Generation Architecture

Single internal **Product Data Layer** (canonical, always up to date from Products/ProductVariants/Inventory) feeds three protocol-specific exporters:

UCP Exporter → `/feeds/ucp` + manifest at `/.well-known/commerce-manifest.json`

ACP Exporter → `/feeds/acp` (Stripe-compatible fields for ChatGPT Instant Checkout)

Perplexity/Google-Shopping-format Exporter → `/feeds/perplexity`

Feeds refresh on a schedule (near-real-time for price/availability changes — stale price or "in stock" data is worse than no listing, since agents lose trust in a merchant that gets flagged as inaccurate) and are validated for required-field completeness before publishing (missing GTIN, broken image URLs, and price/currency mismatches are the most common rejection causes).

## 1.4 Checkout Path

Two tiers, vendor/admin configurable per product via the eligibility flags above:

**Discovery only** (`is_eligible_search: true`, `is_eligible_checkout: false`) — agent surfaces the product and links back to the ATVOO product page, where the customer completes checkout normally. Lowest integration effort, safest starting point.

**Agentic checkout** (`is_eligible_checkout: true`) — agent completes the purchase in-platform via ACP/Stripe or Perplexity's PayPal/Venmo rail. Requires seller Terms of Service and Privacy Policy URLs to be present in the feed, and ATVOO (as merchant of record, or the vendor, depending on payout model) to support the relevant payment rail.

**Recommendation: launch with discovery-only across the whole catalog, then enable agentic checkout selectively** once order-attribution and fraud/dispute handling for agent-originated orders (see 1.6) are proven — an autonomous agent completing a purchase without a human double-checking the cart is a materially different risk profile than a click-through.

## 1.5 An Underused Angle: MCP

Because Claude and other assistants increasingly connect to external tools via the Model Context Protocol (MCP), ATVOO can optionally expose a lightweight MCP server offering `search_products`, `get_product_details`, and `check_availability` as tools. This is a smaller lift than a full ACP/UCP integration and is a natural fit given the assistant you're using to build this platform. Worth treating as a fast, low-risk pilot before committing to the heavier protocols.

## 1.6 Attribution, Analytics & Trust

Every order gets an `AgentOrderAttribution` record: which agent/protocol sourced it (ChatGPT, Perplexity, Gemini, organic, none). Without this, "AI agent traffic" is invisible in analytics — agentic checkout can look like a normal direct order with no referrer.

Admin dashboard: agent impression share, recommendation-inclusion rate, agent-attributed conversion rate, tracked on 30/60/90-day windows — matches how the industry currently measures this, so ATVOO's reporting is comparable to what a vendor might see from other channels.

Fraud/dispute handling must explicitly cover agent-originated orders — return abuse and payment disputes behave differently when the "customer" was an autonomous agent acting on someone's behalf.

## 1.7 Compliance Notes

Some large retailers have blocked AI crawlers or sued over unauthorized agent purchases — this is a live, contested space, not settled practice. ATVOO should keep agent eligibility as an explicit opt-in at the vendor/product level (not silently on for the whole catalog) and keep a kill switch at the admin level to disable agentic checkout platform-wide if a protocol partner's terms or behavior become a liability.

---

# PART 2 — VISUAL SEARCH

## 2.1 Purpose

Customer uploads or photographs an item (in-store, on someone else, in a magazine) and the system returns visually similar products from ATVOO's catalog. Primary use case is mobile, where typing a text query for something you're looking at is friction the camera removes.

## 2.2 Flow

1. Customer taps the camera icon in the search bar (mobile or desktop)
2. Uploads a photo or takes one live
3. Image is sent to the Visual Search Service, which generates an embedding vector using a vision model
4. Vector is compared against `ProductImageEmbeddings` (pgvector, cosine similarity) across the catalog
5. Top-N visually similar products returned, ranked by similarity score, filterable by category/price/vendor like normal search results
6. Query and result set logged to `VisualSearchQueries`/`VisualSearchResults` for relevance tuning and to detect gaps (searches with poor top-score matches signal catalog gaps or where new embeddings need reindexing)

## 2.3 Data Requirements

Every product image gets an embedding generated at upload time (background job, not blocking the vendor's upload flow) and re-generated if the image is replaced.

Multiple images per product should each get an embedding; match against the best-scoring image, not just the primary one, since angle/crop varies a lot in real customer photos.

## 2.4 Non-Functional Requirements

Visual search response time target: under 2 seconds end-to-end (upload → embed → vector search → render), to stay within the platform's stated <2s page-load standard.

Graceful degradation: if no strong match (below similarity threshold), fall back to showing the closest category match plus a prompt to refine with a text query, rather than an empty result.

## 2.5 Related Data Models

See "VISUAL SEARCH MODULE" in 02_DATABASE_ARCHITECTURE.md.

## 2.6 Related APIs

`POST /products/visual-search` — see 04_API_ARCHITECTURE.md.
