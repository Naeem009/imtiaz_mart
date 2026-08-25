import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, ProductStatus } from "@imtiaz-mart/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import {
  mapProductDetail,
  mapProductListItem,
} from "@/modules/catalog/catalog.mapper";
import { ProductsQueryDto } from "./dto/products-query.dto";
import { VisualSearchService } from "@/modules/visual-search/visual-search.service";
import { RedisService } from "@/modules/redis/redis.module";
import { CatalogSearchService } from "@/modules/search/catalog-search.service";

const productInclude = {
  category: true,
  brand: true,
  vendor: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  variants: true,
};

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private visualSearchService: VisualSearchService,
    private redis: RedisService,
    private search: CatalogSearchService,
  ) {}

  async findAll(query: ProductsQueryDto) {
    const cacheKey = `catalog:products:${JSON.stringify(query)}`;
    const cached = await this.redis.getJson<{
      data: ReturnType<typeof mapProductListItem>[];
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>(cacheKey);
    if (cached) return cached;

    const where = await this.buildWhere(query);
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

    const result = {
      data: products.map(mapProductListItem),
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit) || 1,
      },
    };
    await this.redis.setJson(cacheKey, result, 60);
    return result;
  }

  async findBySlug(slug: string) {
    const cacheKey = `catalog:product:${slug}`;
    const cached = await this.redis.getJson<ReturnType<typeof mapProductDetail>>(cacheKey);
    if (cached) return cached;

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

    const dto = mapProductDetail(product);
    await this.redis.setJson(cacheKey, dto, 120);
    return dto;
  }

  async compare(ids: string[]) {
    const unique = [...new Set(ids)].slice(0, 4);
    if (unique.length === 0) return [];

    const products = await this.prisma.client.product.findMany({
      where: {
        id: { in: unique },
        status: ProductStatus.ACTIVE,
        deletedAt: null,
      },
      include: productInclude,
    });
    const byId = new Map(products.map((product) => [product.id, product]));
    return unique
      .map((id) => byId.get(id))
      .filter((product): product is NonNullable<typeof product> => Boolean(product))
      .map(mapProductDetail);
  }

  async getRecommendations(limit = 8) {
    const cacheKey = `catalog:recommended:${limit}`;
    const cached = await this.redis.getJson<ReturnType<typeof mapProductListItem>[]>(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.client.product.findMany({
      where: { status: ProductStatus.ACTIVE, deletedAt: null },
      include: productInclude,
      orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
      take: limit,
    });
    const dto = products.map(mapProductListItem);
    await this.redis.setJson(cacheKey, dto, 120);
    return dto;
  }

  async visualSearch(body: { imageUrl?: string; query?: string }) {
    return this.visualSearchService.search(body.imageUrl, body.query);
  }

  private async buildWhere(query: ProductsQueryDto): Promise<Prisma.ProductWhereInput> {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };

    if (query.q) {
      const ids = await this.search.searchProductIds(query.q);
      if (ids && ids.length > 0) {
        where.id = { in: ids };
      } else if (ids && ids.length === 0) {
        where.id = { in: [] };
      } else {
        where.OR = [
          { name: { contains: query.q, mode: "insensitive" } },
          { shortDescription: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
        ];
      }
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
