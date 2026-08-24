import { Module } from "@nestjs/common";
import { VendorsModule } from "@/modules/vendors/vendors.module";
import { LoyaltyModule } from "@/modules/loyalty/loyalty.module";
import { AffiliatesModule } from "@/modules/affiliates/affiliates.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [VendorsModule, LoyaltyModule, AffiliatesModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
