CREATE TYPE "product_approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "products"
  ADD COLUMN "approval_status" "product_approval_status" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "approval_note" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3);

CREATE INDEX "products_approval_status_idx" ON "products"("approval_status");