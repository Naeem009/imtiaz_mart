# SOCIAL MEDIA AUTOMATION ENGINE (SMAE)

Companion spec to 01–05. Read alongside them before generating code for this module.

---

# 1. PURPOSE

Automatically promote vendor products to the vendor's own connected social media accounts, and surface AI-generated posts to relevant groups/audiences, to grow both vendor and marketplace visibility. This is a vendor-facing, opt-in, subscription-gated feature — never automatic or silent.

---

# 2. SUPPORTED PLATFORMS (Phase 1 → Later)

Facebook Page

Instagram Business

WhatsApp Business Catalog

Pinterest

X (Twitter)

TikTok Business

Google Business Profile (future phase)

---

# 3. SUBSCRIPTION TIER GATING

Ties into VendorSubscriptions (see 02_DATABASE_ARCHITECTURE.md).

Starter — manual "Share to Social" button only, no automation

Growth — scheduled posting, 1 connected platform, standard AI captions

Premium — full automation, all platforms, AI captions + hashtags + best-time-to-post, analytics dashboard

Enterprise — everything in Premium + A/B post variant testing, custom posting cadence rules, white-label option, dedicated rate-limit pool

Enforcement happens via a Subscription Tier Gate Guard at the API layer (see 04_API_ARCHITECTURE.md) — never trust the frontend alone.

---

# 4. END-TO-END FLOW

1. Vendor goes to Vendor Portal → Marketing → Social Automation
2. Vendor connects an account per platform via OAuth 2.0 (explicit consent screen, scopes limited to posting + basic page insights)
3. Vendor turns automation ON per platform (default: OFF)
4. Vendor configures an Automation Rule: trigger event(s), target platform(s), posting schedule, frequency cap, tone preset, review-before-publish toggle
5. Trigger events: New Product Published, Price Drop, Back In Stock, Flash Sale Started, Best Seller Achieved, Restock, Manual "Post Now"
6. AI Content Generation Service drafts caption + hashtags + selects the best product image/video asset
7. Content Moderation Service screens the draft (policy, brand-safety, banned terms) before it can be queued
8. If "review before publish" is on → post goes to the vendor's Post Approval Queue; vendor edits/approves/rejects
9. If "auto-publish" is on → post goes straight to the Post Scheduling Queue and publishes at the AI-suggested or vendor-defined time
10. Platform Publishing Adapter posts through the platform's official Business/Graph API
11. Analytics Ingestion Service pulls back reach, engagement, clicks, and correlates with marketplace click-through/conversion data
12. Vendor sees results on the Social Performance Dashboard

---

# 5. VENDOR CONTROLS (non-negotiable — always explicit opt-in)

Connect / disconnect any account at any time (instant token revocation)

Enable / disable automation independently per platform

Choose which trigger events fire posts

Set max posts per day (frequency cap) and blackout hours

Choose tone/style preset (Professional, Playful, Luxury, Bold)

Exclude specific products or categories from automation

Switch between "auto-publish" and "review before publish" per platform

View/export full history of everything posted on their behalf

---

# 6. AI CAPABILITIES

AI Caption Generation (product-aware, tone-aware)

AI Hashtag Generation (trend + category aware)

AI Best-Time-To-Post Prediction (per platform, per vendor audience)

AI Asset Selection (best-performing image/video from ProductImages/ProductVideos)

AI A/B Post Variant Testing (Enterprise tier)

AI Weekly Performance Digest & Recommendations

---

# 7. SYSTEM ARCHITECTURE COMPONENTS

Social Account Connector Service — OAuth per platform, encrypted token storage

Automation Rules Engine — evaluates trigger events against vendor rules

AI Content Generation Service — LLM-based caption/hashtag/asset generation

Content Moderation Service — pre-publish policy/brand-safety screening

Post Scheduling Queue — Redis + BullMQ, per-platform worker pools

Platform Publishing Adapters — one adapter per platform's official API

Analytics Ingestion Service — pulls engagement metrics, joins with marketplace analytics

Webhook Listener — handles platform callbacks, token expiry, post status changes

---

# 8. COMPLIANCE & SAFETY

OAuth tokens encrypted at rest, rotated, revocable instantly

Strict adherence to each platform's automation/API policy (no spam, respects rate limits)

Mandatory content moderation pass before any auto-publish

Full audit log per post: who/what/when/where/trigger-source

GDPR-compliant handling of connected-account data

Vendor can permanently delete automation history and disconnect at any time

---

# 9. NON-FUNCTIONAL REQUIREMENTS

Queue processing latency < 30s under normal load

Exponential backoff retry on platform API failure (max 5 attempts)

Per-platform failure isolation — one platform failing never blocks others

Horizontally scalable worker processes

Dead-letter queue with vendor-visible failure reason

---

# 10. RELATED DATA MODELS

See "SOCIAL MEDIA AUTOMATION MODULE" in 02_DATABASE_ARCHITECTURE.md:

VendorSocialAccounts, SocialAutomationRules, SocialAutomationTriggers, SocialPostQueue, SocialPostTemplates, SocialPostAssets, SocialPostAnalytics, SocialPlatformWebhookEvents, SocialContentModerationLogs

---

# 11. RELATED APIs

See "VENDOR SOCIAL AUTOMATION APIs" in 04_API_ARCHITECTURE.md.
