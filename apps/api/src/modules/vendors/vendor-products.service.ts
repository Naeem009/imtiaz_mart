import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { VendorProductDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { VendorsService } from "./vendors.service";
import { CreateVendorProductDto } from "./dto/create-vendor-product.dto";
import { UpdateVendorProductDto } from "./dto/update-vendor-product.dto";
import { CatalogSearchService } from "@/modules/search/catalog-search.service";
import { RedisService } from "@/modules/redis/redis.module";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value: { toNumber?: () => number } | number): number {
  return typeof value === "number" ? value : Number(value.toNumber?.() ?? value);
}

@Injectable()
export class VendorProductsService {
  constructor(
    private prisma: PrismaService,
    private vendors: VendorsService,
    private search: CatalogSearchService,
    private redis: RedisService,
  ) {}

  async list(userId: string): Promise<VendorProductDto[]> {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const products = await this.prisma.client.product.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return products.map((product) => this.mapProduct(product));
  }

  async create(userId: string, dto: CreateVendorProductDto): Promise<VendorProductDto> {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const slug = `${slugify(dto.name)}-${Date.now().toString(36)}`;
    const productId = uuidv7();
    const stock = dto.stock ?? 50;

    const product = await this.prisma.client.product.create({
      data: {
        id: productId,
        name: dto.name,
        slug,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId,
        vendorId: vendor.id,
        status: dto.status ?? ProductStatus.DRAFT,
        isEligibleSearch: dto.isEligibleSearch ?? true,
        isEligibleCheckout: dto.isEligibleCheckout ?? false,
        variants: {
          create: {
            id: uuidv7(),
            name: "Default",
            price: dto.price,
            compareAtPrice: dto.compareAtPrice,
            stock,
          },
        },
        images: dto.imageUrl
          ? {
              create: {
                id: uuidv7(),
                url: dto.imageUrl,
                alt: dto.name,
                isPrimary: true,
                sortOrder: 0,
              },
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    await this.search.indexById(product.id);
    await this.redis.delByPrefix("catalog:");
    return this.mapProduct(product);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateVendorProductDto,
  ): Promise<VendorProductDto> {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const existing = await this.prisma.client.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
      include: { variants: true },
    });

    if (!existing) {
      throw new NotFoundException("Product not found");
    }

    if (dto.categoryId && dto.categoryId !== existing.categoryId) {
      const category = await this.prisma.client.category.findFirst({
        where: { id: dto.categoryId, deletedAt: null },
      });
      if (!category) {
        throw new NotFoundException("Category not found");
      }
    }

    await this.prisma.client.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId,
        status: dto.status,
        isEligibleSearch: dto.isEligibleSearch,
        isEligibleCheckout: dto.isEligibleCheckout,
      },
    });

    if (dto.imageUrl !== undefined) {
      const primaryImage = await this.prisma.client.productImage.findFirst({
        where: { productId: id, isPrimary: true },
      });
      if (primaryImage) {
        await this.prisma.client.productImage.update({
          where: { id: primaryImage.id },
          data: { url: dto.imageUrl, alt: dto.name ?? existing.name },
        });
      } else if (dto.imageUrl) {
        await this.prisma.client.productImage.create({
          data: {
            id: uuidv7(),
            productId: id,
            url: dto.imageUrl,
            alt: dto.name ?? existing.name,
            isPrimary: true,
            sortOrder: 0,
          },
        });
      }
    }

    if (dto.stock !== undefined || dto.price !== undefined) {
      const variant = existing.variants[0];
      if (variant) {
        await this.prisma.client.productVariant.update({
          where: { id: variant.id },
          data: {
            stock: dto.stock,
            price: dto.price,
            compareAtPrice: dto.compareAtPrice,
          },
        });
      }
    }

    const product = await this.prisma.client.product.findUniqueOrThrow({
      where: { id },
      include: { category: true, images: true, variants: true },
    });
    await this.search.indexById(product.id);
    await this.redis.delByPrefix("catalog:");
    return this.mapProduct(product);
  }

  async archive(userId: string, id: string) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    await this.prisma.client.product.update({
      where: { id },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });

    await this.search.remove(id);
    await this.redis.delByPrefix("catalog:");
    return { message: "Product archived" };
  }

  private mapProduct(product: {
    id: string;
    name: string;
    slug: string;
    price: { toNumber?: () => number } | number;
    compareAtPrice: { toNumber?: () => number } | number | null;
    shortDescription: string | null;
    description: string | null;
    status: string;
    rating: { toNumber?: () => number } | number;
    reviewCount: number;
    isEligibleSearch: boolean;
    isEligibleCheckout: boolean;
    category: { id: string; name: string };
    images: { url: string; isPrimary: boolean }[];
    variants: { stock: number }[];
  }): VendorProductDto {
    const primary = product.images.find((image) => image.isPrimary) ?? product.images[0];
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: toNumber(product.price),
      compareAtPrice: product.compareAtPrice ? toNumber(product.compareAtPrice) : null,
      shortDescription: product.shortDescription,
      description: product.description,
      status: product.status,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
      rating: toNumber(product.rating),
      reviewCount: product.reviewCount,
      categoryName: product.category.name,
      categoryId: product.category.id,
      primaryImage: primary?.url ?? null,
      isEligibleSearch: product.isEligibleSearch,
      isEligibleCheckout: product.isEligibleCheckout,
    };
  }
}
