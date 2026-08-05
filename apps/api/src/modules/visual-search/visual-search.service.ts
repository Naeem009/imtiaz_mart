import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class VisualSearchService {
  constructor(private prisma: PrismaService) {}

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
      where.images = {
        some: {
          url: { contains: imageUrl, mode: "insensitive" },
        },
      };
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
