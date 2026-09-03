CREATE TABLE "warehouses" (
    "id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT NOT NULL DEFAULT 'PK',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory" (
    "id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "inventory_transaction_type" AS ENUM ('RESTOCK', 'ADJUSTMENT', 'SALE', 'RETURN');
CREATE TABLE "inventory_transactions" (
    "id" TEXT NOT NULL,
    "inventory_id" TEXT NOT NULL,
    "type" "inventory_transaction_type" NOT NULL,
    "delta" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "warehouses_vendor_id_name_key" ON "warehouses"("vendor_id", "name");
CREATE INDEX "warehouses_vendor_id_idx" ON "warehouses"("vendor_id");
CREATE UNIQUE INDEX "inventory_warehouse_id_variant_id_key" ON "inventory"("warehouse_id", "variant_id");
CREATE INDEX "inventory_warehouse_id_idx" ON "inventory"("warehouse_id");
CREATE INDEX "inventory_variant_id_idx" ON "inventory"("variant_id");
CREATE INDEX "inventory_transactions_inventory_id_idx" ON "inventory_transactions"("inventory_id");
CREATE INDEX "inventory_transactions_created_at_idx" ON "inventory_transactions"("created_at");

ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_transactions" ADD CONSTRAINT "inventory_transactions_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;