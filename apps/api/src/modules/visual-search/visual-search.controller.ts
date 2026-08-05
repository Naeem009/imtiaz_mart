import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { VisualSearchService } from "./visual-search.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@ApiTags("visual-search")
@Controller({ path: "products", version: "1" })
export class VisualSearchController {
  constructor(private readonly visualSearchService: VisualSearchService, private prisma: PrismaService) {}
  @Public()
  @Post("visual-search")
  @ApiOperation({ summary: "Search products by image or text hint" })
  search(@Body() body: { imageUrl?: string; query?: string }) {
    return this.visualSearchService.search(body.imageUrl, body.query);
  }

  @Public()
  @Post("visual-search/reindex")
  @ApiOperation({ summary: "Reindex product image embeddings" })
  async reindex() {
    // iterate product images and generate embeddings via VisualSearchService's dependencies
    const images = await this.prisma.client.productImage.findMany({ include: { product: true } });
    let count = 0;
    for (const img of images) {
      try {
        const embedding = await (this.visualSearchService as any).embeddings.embedUrl(img.url);
        await this.prisma.client.productImageEmbedding.upsert({
          where: { productImageId: img.id },
          update: { embedding },
          create: { productImageId: img.id, embedding },
        });
        count++;
      } catch (err) {
        // ignore
      }
    }
    return { indexed: count };
  }
}
