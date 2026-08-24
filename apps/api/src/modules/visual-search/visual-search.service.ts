import { Injectable } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { PaginatedProducts } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { EmbeddingsService } from "@/modules/embeddings/embeddings.service";
import { mapProductListItem } from "@/modules/catalog/catalog.mapper";

@Injectable()
export class VisualSearchService {
  constructor(
    private prisma: PrismaService,
    private embeddings: EmbeddingsService,
  ) {}

  async search(imageUrl?: string, query?: string): Promise<PaginatedProducts> {
    if (imageUrl) {
      const queryEmbedding = await this.embeddings.embedUrl(imageUrl);
      const embeddings = await this.prisma.client.productImageEmbedding.findMany({
        include: {
          productImage: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: "asc" as const } },
                  variants: true,
                  brand: true,
                  category: true,
                  vendor: true,
                },
              },
            },
          },
        },
      });

      const scores = new Map<string, { score: number; product: (typeof embeddings)[number]["productImage"]["product"] }>();
      for (const row of embeddings) {
        const vec = row.embedding as number[];
        if (!Array.isArray(vec)) continue;
        const product = row.productImage.product;
        if (!product || product.status !== ProductStatus.ACTIVE || product.deletedAt) {
          continue;
        }
        if (query) {
          const haystack = `${product.name} ${product.shortDescription ?? ""}`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) continue;
        }
        const score = cosineSimilarity(queryEmbedding, vec);
        const prev = scores.get(product.id);
        if (!prev || score > prev.score) {
          scores.set(product.id, { score, product });
        }
      }

      const products = Array.from(scores.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 24)
        .map((entry) => mapProductListItem(entry.product));

      if (products.length === 0) {
        return this.textSearch(query);
      }

      return {
        data: products,
        meta: {
          page: 1,
          limit: 24,
          total: products.length,
          totalPages: 1,
        },
      };
    }

    return this.textSearch(query);
  }

  private async textSearch(query?: string): Promise<PaginatedProducts> {
    const where = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" as const } },
              { shortDescription: { contains: query, mode: "insensitive" as const } },
              { description: { contains: query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

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

    const data = products.map(mapProductListItem);
    return {
      data,
      meta: { page: 1, limit: 24, total: data.length, totalPages: 1 },
    };
  }

  async reindex() {
    const images = await this.prisma.client.productImage.findMany({
      include: { product: true },
    });
    let indexed = 0;

    for (const image of images) {
      try {
        const embedding = await this.embeddings.embedUrl(
          `${image.url}:${image.product.name}`,
        );
        await this.prisma.client.productImageEmbedding.upsert({
          where: { productImageId: image.id },
          update: { embedding },
          create: {
            id: uuidv7(),
            productImageId: image.id,
            embedding,
          },
        });
        indexed += 1;
      } catch {
        // skip individual embedding failures
      }
    }

    return { indexed, total: images.length };
  }
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
