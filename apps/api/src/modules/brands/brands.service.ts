import { Injectable } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { BrandListItem } from "@imtiaz-mart/shared";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<BrandListItem[]> {
    const brands = await this.prisma.client.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE, deletedAt: null },
            },
          },
        },
      },
    });

    return brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
      productCount: b._count.products,
    }));
  }
}
