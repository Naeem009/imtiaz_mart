# DATABASE ARCHITECTURE

Database Engine: PostgreSQL 17+ (with pgvector extension for embeddings)

ORM: Prisma

ID Strategy: UUID v7

---

# AUTHENTICATION MODULE

Users

Roles

Permissions

UserRoles

Sessions

RefreshTokens

OAuthAccounts

Devices

---

# CUSTOMER MODULE

Customers

CustomerAddresses

SavedPaymentMethods

RewardPoints

CustomerGroups

CustomerSegments

---

# VENDOR MODULE

Vendors

VendorStaff

VendorFollowers

VendorDocuments

VendorPayouts

VendorSubscriptions

VendorAnalytics

---

# SOCIAL MEDIA AUTOMATION MODULE

## Mode A — Vendor Channel (vendor-owned accounts)

VendorSocialAccounts

SocialAutomationRules

SocialAutomationTriggers

SocialPostQueue

SocialPostTemplates

SocialPostAssets

SocialPostAnalytics

## Mode B — Store Channel (marketplace-owned accounts)

StoreSocialAccounts

StoreCurationRules

StoreSocialPostQueue

StoreSocialPostAnalytics

VendorStoreFeatureOptIn

SponsoredSlotBookings

## Shared

SocialPlatformWebhookEvents

SocialContentModerationLogs

---

# VISUAL SEARCH MODULE

ProductImageEmbeddings (vector, pgvector extension)

VisualSearchQueries

VisualSearchResults

---

# AI AGENT COMMERCE MODULE

AgentProductFeedExports (UCP / ACP / Perplexity-format snapshots)

AgentCommerceManifest (`.well-known` manifest config)

AgentEligibilityFlags (per-product: is_eligible_search, is_eligible_checkout)

AgentOrderAttribution (which agent/protocol sourced the order)

---

# PRODUCT CATALOG

Categories

Brands

Products

ProductVariants

Attributes

AttributeValues

ProductImages

ProductVideos

ProductDocuments

ProductTags

ProductFAQs

ProductSEO

---

# INVENTORY MODULE

Warehouses

Inventory

InventoryTransactions

StockReservations

LowStockAlerts

---

# ORDER MANAGEMENT

Orders

OrderItems

OrderStatusHistory

Shipments

ShipmentTracking

Returns

Refunds

Invoices

---

# PAYMENT MODULE

Payments

Transactions

PaymentMethods

PaymentLogs

VendorPayouts

EscrowHoldings

---

# MARKETING MODULE

Coupons

CouponUsage

GiftCards

GiftCardTransactions

ReferralPrograms

Referrals

Affiliates

AffiliateCommissions

Campaigns

---

# CUSTOMER ENGAGEMENT

Reviews

ReviewVotes

Questions

Answers

Wishlists

WishlistItems

CompareLists

RecentlyViewed

ProductAlerts

---

# CMS MODULE

Pages

Menus

MenuItems

BlogCategories

BlogPosts

FAQs

HomepageSections

Banners

MediaLibrary

SEOSettings

---

# NOTIFICATIONS

Notifications

NotificationTemplates

EmailLogs

SMSLogs

PushLogs

WhatsAppLogs

---

# SUPPORT

SupportTickets

TicketReplies

TicketAttachments

---

# ANALYTICS

SearchAnalytics

TrafficAnalytics

ConversionAnalytics

SalesAnalytics

VendorAnalytics

CustomerAnalytics

---

# AUDIT

AuditLogs

ActivityLogs

SystemLogs

---

# DATABASE RULES

UUID Primary Keys

Foreign Keys

Soft Deletes

CreatedAt

UpdatedAt

DeletedAt

Audit Tracking

Optimized Indexing

ACID Transactions
