import { Module } from "@nestjs/common";
import { VendorsModule } from "@/modules/vendors/vendors.module";
import { InventoryController } from "./inventory.controller";
import { InventoryService } from "./inventory.service";

@Module({
  imports: [VendorsModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
