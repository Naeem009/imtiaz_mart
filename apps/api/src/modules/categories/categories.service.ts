import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { CategoryListItem } from "@imtiaz-mart/shared";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ProductsService } from "@/modules/products/products.service";
import { ProductsQueryDto } from "@/modules/products/dto/products-query.dto";

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async findAll(): Promise<CategoryListItem[]> {
    const categories = await this.prisma.client.category.findMany({
      where: { deletedAt: null, parentId: null },
      orderBy: { sortOrder: "asc" },
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

    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    }));
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.client.category.findFirst({
      where: { slug, deletedAt: null },
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

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      description: category.description,
      productCount: category._count.products,
    };
  }

  async getCategoryProducts(slug: string, query: ProductsQueryDto) {
    await this.findBySlug(slug);
    return this.productsService.findAll({ ...query, category: slug });
  }
}
