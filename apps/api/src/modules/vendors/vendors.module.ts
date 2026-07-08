import { Module } from "@nestjs/common";
import { VendorsController, PublicVendorsController } from "./vendors.controller";
import { VendorsService } from "./vendors.service";
import { VendorProductsService } from "./vendor-products.service";
import { VendorOrdersService } from "./vendor-orders.service";

@Module({
  controllers: [VendorsController, PublicVendorsController],
  providers: [VendorsService, VendorProductsService, VendorOrdersService],
  exports: [VendorsService],
})
export class VendorsModule {}
