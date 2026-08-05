import { Module } from "@nestjs/common";
import { FeedsController } from "./feeds.controller";
import { FeedsService } from "./feeds.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [FeedsController],
  providers: [FeedsService],
  exports: [FeedsService],
})
export class FeedsModule {}
