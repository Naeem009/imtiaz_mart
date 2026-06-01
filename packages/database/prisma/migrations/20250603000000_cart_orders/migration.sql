-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_addresses" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'Home',
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'PK',
    "phone" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "customer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shipping_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "shipping_name" TEXT NOT NULL,
    "shipping_phone" TEXT,
    "shipping_line1" TEXT NOT NULL,
    "shipping_line2" TEXT,
    "shipping_city" TEXT NOT NULL,
    "shipping_state" TEXT,
    "shipping_postal" TEXT NOT NULL,
    "shipping_country" TEXT NOT NULL DEFAULT 'PK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "variant_name" TEXT NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "status" "order_status" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "method" TEXT NOT NULL DEFAULT 'cod',
    "transaction_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_user_id_key" ON "customers"("user_id");
CREATE INDEX "customer_addresses_customer_id_idx" ON "customer_addresses"("customer_id");
CREATE UNIQUE INDEX "carts_customer_id_key" ON "carts"("customer_id");
CREATE UNIQUE INDEX "carts_session_id_key" ON "carts"("session_id");
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");
CREATE UNIQUE INDEX "cart_items_cart_id_variant_id_key" ON "cart_items"("cart_id", "variant_id");
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history"("order_id");
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_addresses" ADD CONSTRAINT "customer_addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
