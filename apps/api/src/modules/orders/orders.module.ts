import { Module } from "@nestjs/common";
import { CartModule } from "@/modules/cart/cart.module";
import { LoyaltyModule } from "@/modules/loyalty/loyalty.module";
import { AffiliatesModule } from "@/modules/affiliates/affiliates.module";
import { PaymentsModule } from "@/modules/payments/payments.module";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [CartModule, LoyaltyModule, AffiliatesModule, PaymentsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
