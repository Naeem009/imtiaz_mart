-- Align newer-feature tables with Prisma schema: missing indexes and order FKs.

CREATE INDEX IF NOT EXISTS "orders_order_number_idx" ON "orders"("order_number");
CREATE INDEX IF NOT EXISTS "reviews_order_id_idx" ON "reviews"("order_id");
CREATE INDEX IF NOT EXISTS "reward_transactions_order_id_idx" ON "reward_transactions"("order_id");

ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "reviews_order_id_fkey";
ALTER TABLE "reviews"
ADD CONSTRAINT "reviews_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reward_transactions" DROP CONSTRAINT IF EXISTS "reward_transactions_order_id_fkey";
ALTER TABLE "reward_transactions"
ADD CONSTRAINT "reward_transactions_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "affiliate_commissions" DROP CONSTRAINT IF EXISTS "affiliate_commissions_order_id_fkey";
ALTER TABLE "affiliate_commissions"
ADD CONSTRAINT "affiliate_commissions_order_id_fkey"
FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
