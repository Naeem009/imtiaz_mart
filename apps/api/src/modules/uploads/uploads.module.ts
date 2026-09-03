import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { VendorsModule } from "@/modules/vendors/vendors.module";

@Module({
  imports: [PrismaModule, VendorsModule],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
