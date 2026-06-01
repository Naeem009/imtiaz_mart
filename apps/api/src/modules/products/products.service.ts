import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "@imtiaz-mart/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import {
  mapProductDetail,
  mapProductListItem,
} from "@/modules/catalog/catalog.mapper";
import { ProductsQueryDto } from "./dto/products-query.dto";

const productInclude = {
  category: true,
  brand: true,
  vendor: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: true,
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ProductsQueryDto) {
    const where = this.buildWhere(query);
    const orderBy = this.buildOrderBy(query.sort);
    const skip = (query.page - 1) * query.limit;

    const [total, products] = await Promise.all([
      this.prisma.client.product.count({ where }),
      this.prisma.client.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip,
        take: query.limit,
      }),
    ]);

    return {
      data: products.map(mapProductListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.client.product.findFirst({
      where: {
        slug,
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return mapProductDetail(product);
  }

  async getRecommendations(limit = 8) {
    const products = await this.prisma.client.product.findMany({
      where: { status: ProductStatus.ACTIVE, deletedAt: null },
      include: productInclude,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: limit,
    });
    return products.map(mapProductListItem);
  }

  private buildWhere(query: ProductsQueryDto): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };

    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { shortDescription: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }
    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.brand) {
      where.brand = { slug: query.brand };
    }
    if (query.vendor) {
      where.vendor = { slug: query.vendor };
    }

    return where;
  }

  private buildOrderBy(
    sort?: string,
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case "price_asc":
        return [{ price: "asc" }];
      case "price_desc":
        return [{ price: "desc" }];
      case "rating":
        return [{ rating: "desc" }, { reviewCount: "desc" }];
      case "bestseller":
      case "trending":
        return [{ reviewCount: "desc" }, { rating: "desc" }];
      case "newest":
      default:
        return [{ createdAt: "desc" }];
    }
  }
}
