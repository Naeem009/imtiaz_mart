import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateVendorProductDto } from "./dto/create-vendor-product.dto";
import { UpdateVendorProductDto } from "./dto/update-vendor-product.dto";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class VendorProductsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    const vendor = await this.getVendor(userId);

    return this.prisma.client.product.findMany({
      where: { vendorId: vendor.id, deletedAt: null },
      include: {
        images: { orderBy: { id: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateVendorProductDto) {
    const vendor = await this.getVendor(userId);
    const slug = `${slugify(dto.name)}-${Date.now().toString(36)}`;

    return this.prisma.client.product.create({
      data: {
        id: uuidv7(),
        name: dto.name,
        slug,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId,
        vendorId: vendor.id,
        status: dto.status ?? ProductStatus.DRAFT,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateVendorProductDto) {
    const vendor = await this.getVendor(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.prisma.client.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        compareAtPrice: dto.compareAtPrice,
        shortDescription: dto.shortDescription,
        description: dto.description,
        status: dto.status,
      },
    });
  }

  async archive(userId: string, id: string) {
    const vendor = await this.getVendor(userId);
    const product = await this.prisma.client.product.findFirst({
      where: { id, vendorId: vendor.id, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException("Product not found");
    }

    return this.prisma.client.product.update({
      where: { id },
      data: {
        status: ProductStatus.ARCHIVED,
        deletedAt: new Date(),
      },
    });
  }

  private async getVendor(userId: string) {
    const vendor = await this.prisma.client.vendor.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    return vendor;
  }
}
