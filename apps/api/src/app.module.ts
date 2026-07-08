import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ["../../.env", ".env"],
    }),
    PrismaModule,
    CustomersModule,
    HealthModule,
    AuthModule,
    ProductsModule,
    VendorsModule,
    CategoriesModule,
    BrandsModule,
    CartModule,
    OrdersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
