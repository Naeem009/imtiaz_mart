import { Module } from "@nestjs/common";
import { VisualSearchModule } from "@/modules/visual-search/visual-search.module";
import { PaymentsModule } from "@/modules/payments/payments.module";
import { ReturnsModule } from "@/modules/returns/returns.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
  imports: [VisualSearchModule, PaymentsModule, ReturnsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
