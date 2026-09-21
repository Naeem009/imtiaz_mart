CREATE TABLE IF NOT EXISTS "product_questions" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_questions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "product_answers" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "from_vendor" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_answers_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "product_questions_product_id_idx" ON "product_questions"("product_id");
CREATE INDEX IF NOT EXISTS "product_questions_customer_id_idx" ON "product_questions"("customer_id");
CREATE INDEX IF NOT EXISTS "product_answers_question_id_idx" ON "product_answers"("question_id");
CREATE INDEX IF NOT EXISTS "product_answers_user_id_idx" ON "product_answers"("user_id");

ALTER TABLE "product_questions" DROP CONSTRAINT IF EXISTS "product_questions_product_id_fkey";
ALTER TABLE "product_questions"
ADD CONSTRAINT "product_questions_product_id_fkey"
FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_questions" DROP CONSTRAINT IF EXISTS "product_questions_customer_id_fkey";
ALTER TABLE "product_questions"
ADD CONSTRAINT "product_questions_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_answers" DROP CONSTRAINT IF EXISTS "product_answers_question_id_fkey";
ALTER TABLE "product_answers"
ADD CONSTRAINT "product_answers_question_id_fkey"
FOREIGN KEY ("question_id") REFERENCES "product_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_answers" DROP CONSTRAINT IF EXISTS "product_answers_user_id_fkey";
ALTER TABLE "product_answers"
ADD CONSTRAINT "product_answers_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
