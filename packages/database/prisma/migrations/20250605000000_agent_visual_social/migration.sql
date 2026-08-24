-- Product AI eligibility flags
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "is_eligible_search" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "is_eligible_checkout" BOOLEAN NOT NULL DEFAULT false;

-- Visual search embeddings
CREATE TABLE IF NOT EXISTS "product_image_embeddings" (
    "id" TEXT NOT NULL,
    "product_image_id" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_image_embeddings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_image_embeddings_product_image_id_key"
ON "product_image_embeddings"("product_image_id");

CREATE INDEX IF NOT EXISTS "product_image_embeddings_product_image_id_idx"
ON "product_image_embeddings"("product_image_id");

ALTER TABLE "product_image_embeddings" DROP CONSTRAINT IF EXISTS "product_image_embeddings_product_image_id_fkey";
ALTER TABLE "product_image_embeddings"
ADD CONSTRAINT "product_image_embeddings_product_image_id_fkey"
FOREIGN KEY ("product_image_id") REFERENCES "product_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Subscription tiers
DO $$ BEGIN
  CREATE TYPE "subscription_tier" AS ENUM ('STARTER', 'GROWTH', 'PREMIUM', 'ENTERPRISE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "vendor_subscriptions" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "tier" "subscription_tier" NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_subscriptions_vendor_id_key" ON "vendor_subscriptions"("vendor_id");
CREATE INDEX IF NOT EXISTS "vendor_subscriptions_vendor_id_idx" ON "vendor_subscriptions"("vendor_id");

ALTER TABLE "vendor_subscriptions" DROP CONSTRAINT IF EXISTS "vendor_subscriptions_vendor_id_fkey";
ALTER TABLE "vendor_subscriptions"
ADD CONSTRAINT "vendor_subscriptions_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Social automation
DO $$ BEGIN
  CREATE TYPE "social_post_status" AS ENUM ('PENDING', 'SCHEDULED', 'SENT', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "vendor_social_accounts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "access_token_encrypted" TEXT,
    "refresh_token_encrypted" TEXT,
    "scopes" TEXT[] NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_social_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "vendor_social_accounts_provider_provider_account_id_key"
ON "vendor_social_accounts"("provider", "provider_account_id");
CREATE INDEX IF NOT EXISTS "vendor_social_accounts_vendor_id_idx" ON "vendor_social_accounts"("vendor_id");

ALTER TABLE "vendor_social_accounts" DROP CONSTRAINT IF EXISTS "vendor_social_accounts_vendor_id_fkey";
ALTER TABLE "vendor_social_accounts"
ADD CONSTRAINT "vendor_social_accounts_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "social_automation_rules" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "triggers" TEXT[] NOT NULL,
    "platforms" TEXT[] NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_automation_rules_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "social_automation_rules_vendor_id_idx" ON "social_automation_rules"("vendor_id");

ALTER TABLE "social_automation_rules" DROP CONSTRAINT IF EXISTS "social_automation_rules_vendor_id_fkey";
ALTER TABLE "social_automation_rules"
ADD CONSTRAINT "social_automation_rules_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "social_post_queue" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "rule_id" TEXT,
    "status" "social_post_status" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_post_queue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "social_post_queue_vendor_id_idx" ON "social_post_queue"("vendor_id");

ALTER TABLE "social_post_queue" DROP CONSTRAINT IF EXISTS "social_post_queue_vendor_id_fkey";
ALTER TABLE "social_post_queue" DROP CONSTRAINT IF EXISTS "social_post_queue_rule_id_fkey";
ALTER TABLE "social_post_queue"
ADD CONSTRAINT "social_post_queue_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_post_queue"
ADD CONSTRAINT "social_post_queue_rule_id_fkey"
FOREIGN KEY ("rule_id") REFERENCES "social_automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "social_posts" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "queue_id" TEXT,
    "platform" TEXT NOT NULL,
    "platform_post_id" TEXT,
    "status" "social_post_status" NOT NULL DEFAULT 'SENT',
    "published_at" TIMESTAMP(3),
    "response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_posts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "social_posts_vendor_id_idx" ON "social_posts"("vendor_id");

ALTER TABLE "social_posts" DROP CONSTRAINT IF EXISTS "social_posts_vendor_id_fkey";
ALTER TABLE "social_posts" DROP CONSTRAINT IF EXISTS "social_posts_queue_id_fkey";
ALTER TABLE "social_posts"
ADD CONSTRAINT "social_posts_vendor_id_fkey"
FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_posts"
ADD CONSTRAINT "social_posts_queue_id_fkey"
FOREIGN KEY ("queue_id") REFERENCES "social_post_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "social_content_moderation_logs" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_content_moderation_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "social_content_moderation_logs_queue_id_idx"
ON "social_content_moderation_logs"("queue_id");

ALTER TABLE "social_content_moderation_logs" DROP CONSTRAINT IF EXISTS "social_content_moderation_logs_queue_id_fkey";
ALTER TABLE "social_content_moderation_logs"
ADD CONSTRAINT "social_content_moderation_logs_queue_id_fkey"
FOREIGN KEY ("queue_id") REFERENCES "social_post_queue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
