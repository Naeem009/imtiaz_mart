import { Module } from "@nestjs/common";
import { VisualSearchService } from "./visual-search.service";
import { EmbeddingsService } from "@/modules/embeddings/embeddings.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [VisualSearchService, EmbeddingsService],
  exports: [VisualSearchService],
})
export class VisualSearchModule {}
