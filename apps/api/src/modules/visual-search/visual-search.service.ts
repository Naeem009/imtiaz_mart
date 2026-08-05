import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { EmbeddingsService } from "@/modules/embeddings/embeddings.service";

@Injectable()
export class VisualSearchService {
  constructor(private prisma: PrismaService, private embeddings: EmbeddingsService) {}

  async search(imageUrl?: string, query?: string) {
    const where: any = {
      status: "ACTIVE",
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { shortDescription: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (imageUrl) {
      // generate embedding for query image
      const queryEmbedding = await this.embeddings.embedUrl(imageUrl);

      // load all image embeddings
      const embeddings = await this.prisma.client.productImageEmbedding.findMany({
        include: { productImage: { include: { product: { include: { images: true, variants: true, brand: true, category: true, vendor: true } } } } },
      });

      // compute best score per product
      const scores = new Map<string, { score: number; product: any }>();
      for (const e of embeddings) {
        try {
          const vec = e.embedding as number[];
          if (!Array.isArray(vec)) continue;
          const score = cosineSimilarity(queryEmbedding, vec);
          const prod = (e as any).productImage.product;
          if (!prod) continue;
          const prev = scores.get(prod.id);
          if (!prev || score > prev.score) {
            scores.set(prod.id, { score, product: prod });
          }
        } catch (err) {
          // ignore malformed embeddings
        }
      }

      // collect top products
      const arr = Array.from(scores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 24)
        .map((s) => s.product);

      return arr;
    }

    const products = await this.prisma.client.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        vendor: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 24,
    });

    return products;
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
