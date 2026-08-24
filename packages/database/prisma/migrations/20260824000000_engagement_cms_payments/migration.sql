-- Order status: RETURNED
DO $$ BEGIN
  ALTER TYPE "order_status" ADD VALUE IF NOT EXISTS 'RETURNED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Order loyalty / affiliate columns
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "affiliate_code" TEXT,
ADD COLUMN IF NOT EXISTS "points_redeemed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "points_earned" INTEGER NOT NULL DEFAULT 0;

-- Payments extras
ALTER TABLE "payments"
ADD COLUMN IF NOT EXISTS "gateway" TEXT,
ADD COLUMN IF NOT EXISTS "last_four" TEXT,
ADD COLUMN IF NOT EXISTS "brand" TEXT,
ADD COLUMN IF NOT EXISTS "metadata" JSONB,
ADD COLUMN IF NOT EXISTS "captured_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "payment_logs" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "message" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "payment_logs_payment_id_idx" ON "payment_logs"("payment_id");
ALTER TABLE "payment_logs" DROP CONSTRAINT IF EXISTS "payment_logs_payment_id_fkey";
ALTER TABLE "payment_logs"
ADD CONSTRAINT "payment_logs_payment_id_fkey"
FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "saved_payment_methods" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "brand" TEXT,
    "last_four" TEXT NOT NULL,
    "exp_month" INTEGER,
    "exp_year" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "saved_payment_methods_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "saved_payment_methods_customer_id_idx" ON "saved_payment_methods"("customer_id");
ALTER TABLE "saved_payment_methods" DROP CONSTRAINT IF EXISTS "saved_payment_methods_customer_id_fkey";
ALTER TABLE "saved_payment_methods"
ADD CONSTRAINT "saved_payment_methods_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "escrow_holdings" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'HELD',
    "released_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "escrow_holdings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "escrow_holdings_order_id_idx" ON "escrow_holdings"("order_id");
CREATE INDEX IF NOT EXISTS "escrow_holdings_vendor_id_idx" ON "escrow_holdings"("vendor_id");
ALTER TABLE "escrow_holdings" DROP CONSTRAINT IF EXISTS "escrow_holdings_order_id_fkey";
ALTER TABLE "escrow_holdings" DROP CONSTRAINT IF EXISTS "escrow_holdings_vendor_id_fkey";
ALTER TABLE "escrow_holdings"
ADD CONSTRAINT "escrow_holdings_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "escrow_holdings"
ADD CONSTRAINT "escrow_holdings_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "vendor_payouts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_payouts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "vendor_payouts_vendor_id_idx" ON "vendor_payouts"("vendor_id");
ALTER TABLE "vendor_payouts" DROP CONSTRAINT IF EXISTS "vendor_payouts_vendor_id_fkey";
ALTER TABLE "vendor_payouts"
ADD CONSTRAINT "vendor_payouts_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "order_id" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_product_id_customer_id_key" ON "reviews"("product_id", "customer_id");
CREATE INDEX IF NOT EXISTS "reviews_product_id_idx" ON "reviews"("product_id");
CREATE INDEX IF NOT EXISTS "reviews_customer_id_idx" ON "reviews"("customer_id");
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_product_id_fkey";
ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_customer_id_fkey";
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "review_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "helpful" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "review_votes_review_id_customer_id_key" ON "review_votes"("review_id", "customer_id");
ALTER TABLE "review_votes" DROP CONSTRAINT IF EXISTS "review_votes_review_id_fkey";
ALTER TABLE "review_votes" DROP CONSTRAINT IF EXISTS "review_votes_customer_id_fkey";
ALTER TABLE "review_votes"
ADD CONSTRAINT "review_votes_review_id_fkey"
FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_votes"
ADD CONSTRAINT "review_votes_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "wishlists" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_customer_id_key" ON "wishlists"("customer_id");
ALTER TABLE "wishlists" DROP CONSTRAINT IF EXISTS "wishlists_customer_id_fkey";
ALTER TABLE "wishlists"
ADD CONSTRAINT "wishlists_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "wishlist_items" (
    "id" TEXT NOT NULL,
    "wishlist_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "wishlist_items_wishlist_id_product_id_key" ON "wishlist_items"("wishlist_id", "product_id");
CREATE INDEX IF NOT EXISTS "wishlist_items_product_id_idx" ON "wishlist_items"("product_id");
ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "wishlist_items_wishlist_id_fkey";
ALTER TABLE "wishlist_items" DROP CONSTRAINT IF EXISTS "wishlist_items_product_id_fkey";
ALTER TABLE "wishlist_items"
ADD CONSTRAINT "wishlist_items_wishlist_id_fkey"
FOREIGN KEY ("wishlist_id") REFERENCES "wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items"
ADD CONSTRAINT "wishlist_items_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "reward_accounts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lifetime" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reward_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "reward_accounts_customer_id_key" ON "reward_accounts"("customer_id");
ALTER TABLE "reward_accounts" DROP CONSTRAINT IF EXISTS "reward_accounts_customer_id_fkey";
ALTER TABLE "reward_accounts"
ADD CONSTRAINT "reward_accounts_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "reward_transactions" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reward_transactions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "reward_transactions_account_id_idx" ON "reward_transactions"("account_id");
ALTER TABLE "reward_transactions" DROP CONSTRAINT IF EXISTS "reward_transactions_account_id_fkey";
ALTER TABLE "reward_transactions"
ADD CONSTRAINT "reward_transactions_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "reward_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "affiliates" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "commission_rate" DECIMAL(5,4) NOT NULL DEFAULT 0.05,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliates_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "affiliates_user_id_key" ON "affiliates"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "affiliates_code_key" ON "affiliates"("code");
ALTER TABLE "affiliates" DROP CONSTRAINT IF EXISTS "affiliates_user_id_fkey";
ALTER TABLE "affiliates"
ADD CONSTRAINT "affiliates_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliate_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "affiliate_commissions_affiliate_id_idx" ON "affiliate_commissions"("affiliate_id");
CREATE INDEX IF NOT EXISTS "affiliate_commissions_order_id_idx" ON "affiliate_commissions"("order_id");
ALTER TABLE "affiliate_commissions" DROP CONSTRAINT IF EXISTS "affiliate_commissions_affiliate_id_fkey";
ALTER TABLE "affiliate_commissions"
ADD CONSTRAINT "affiliate_commissions_affiliate_id_fkey"
FOREIGN KEY ("affiliate_id") REFERENCES "affiliates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DO $$ BEGIN
  CREATE TYPE "return_status" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'RECEIVED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "return_requests" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "return_status" NOT NULL DEFAULT 'REQUESTED',
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "return_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "return_requests_order_id_idx" ON "return_requests"("order_id");
CREATE INDEX IF NOT EXISTS "return_requests_customer_id_idx" ON "return_requests"("customer_id");
ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "return_requests_order_id_fkey";
ALTER TABLE "return_requests" DROP CONSTRAINT IF EXISTS "return_requests_customer_id_fkey";
ALTER TABLE "return_requests"
ADD CONSTRAINT "return_requests_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "return_requests"
ADD CONSTRAINT "return_requests_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "return_items" (
    "id" TEXT NOT NULL,
    "return_id" TEXT NOT NULL,
    "order_item_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "return_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "return_items_return_id_idx" ON "return_items"("return_id");
ALTER TABLE "return_items" DROP CONSTRAINT IF EXISTS "return_items_return_id_fkey";
ALTER TABLE "return_items" DROP CONSTRAINT IF EXISTS "return_items_order_item_id_fkey";
ALTER TABLE "return_items" DROP CONSTRAINT IF EXISTS "return_items_product_id_fkey";
ALTER TABLE "return_items"
ADD CONSTRAINT "return_items_return_id_fkey"
FOREIGN KEY ("return_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "return_items"
ADD CONSTRAINT "return_items_order_item_id_fkey"
FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "return_items"
ADD CONSTRAINT "return_items_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cms_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "excerpt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "cms_pages_slug_key" ON "cms_pages"("slug");

CREATE TABLE IF NOT EXISTS "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "cover_url" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_key" ON "blog_posts"("slug");

CREATE TABLE IF NOT EXISTS "faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "href" TEXT,
    "placement" TEXT NOT NULL DEFAULT 'home',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "menus" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "menus_location_key" ON "menus"("location");

CREATE TABLE IF NOT EXISTS "menu_items" (
    "id" TEXT NOT NULL,
    "menu_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "menu_items_menu_id_idx" ON "menu_items"("menu_id");
ALTER TABLE "menu_items" DROP CONSTRAINT IF EXISTS "menu_items_menu_id_fkey";
ALTER TABLE "menu_items"
ADD CONSTRAINT "menu_items_menu_id_fkey"
FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
