import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { HttpExceptionFilter } from "@/common/filters/http-exception.filter";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { RolesGuard } from "@/common/guards/roles.guard";
import { AuthModule } from "@/modules/auth/auth.module";
import { BrandsModule } from "@/modules/brands/brands.module";
import { CartModule } from "@/modules/cart/cart.module";
import { CategoriesModule } from "@/modules/categories/categories.module";
import { CustomersModule } from "@/modules/customers/customers.module";
import { OrdersModule } from "@/modules/orders/orders.module";
import { HealthModule } from "@/modules/health/health.module";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { ProductsModule } from "@/modules/products/products.module";
import { VendorsModule } from "@/modules/vendors/vendors.module";
import { AgentCommerceModule } from "@/modules/agent-commerce/agent-commerce.module";
import { VisualSearchModule } from "@/modules/visual-search/visual-search.module";
import { UploadsModule } from "@/modules/uploads/uploads.module";
import { FeedsModule } from "@/modules/feeds/feeds.module";
import { SocialAutomationModule } from "@/modules/social-automation/social-automation.module";
import { AdminModule } from "@/modules/admin/admin.module";
import { RedisModule } from "@/modules/redis/redis.module";
import { SearchModule } from "@/modules/search/search.module";
import { ReviewsModule } from "@/modules/reviews/reviews.module";
import { WishlistModule } from "@/modules/wishlist/wishlist.module";
import { LoyaltyModule } from "@/modules/loyalty/loyalty.module";
import { AffiliatesModule } from "@/modules/affiliates/affiliates.module";
import { ReturnsModule } from "@/modules/returns/returns.module";
import { PaymentsModule } from "@/modules/payments/payments.module";
import { CmsModule } from "@/modules/cms/cms.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
      validate: (config) => {
        const isProduction = config.NODE_ENV === "production";
        const required = ["DATABASE_URL", "JWT_SECRET", "JWT_REFRESH_SECRET"];
        if (isProduction) {
          required.push("APP_URL", "CORS_ORIGIN", "SOCIAL_ENCRYPTION_KEY");
          for (const name of required) {
            if (!config[name] || config[name].includes("change-me") || config[name].includes("localhost")) {
              throw new Error(`${name} must be configured for production`);
            }
          }
          if (config.SOCIAL_ENCRYPTION_KEY.length < 32) {
            throw new Error("SOCIAL_ENCRYPTION_KEY must be at least 32 characters");
          }
        }
        return config;
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    RedisModule,
    SearchModule,
    CustomersModule,
    HealthModule,
    AuthModule,
    ProductsModule,
    VendorsModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    OrdersModule,
    AgentCommerceModule,
    VisualSearchModule,
    UploadsModule,
    FeedsModule,
    SocialAutomationModule,
    AdminModule,
    ReviewsModule,
    WishlistModule,
    LoyaltyModule,
    AffiliatesModule,
    ReturnsModule,
    PaymentsModule,
    CmsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
