import { Module } from "@nestjs/common";
import { VisualSearchController } from "./visual-search.controller";
import { VisualSearchService } from "./visual-search.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [VisualSearchController],
  providers: [VisualSearchService],
})
export class VisualSearchModule {}
