import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type { VendorProfileDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

@Injectable()
export class VendorsService {
  constructor(private prisma: PrismaService) {}

  async resolveVendorForUser(userId: string) {
    const owned = await this.prisma.client.vendor.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });
    if (owned) return owned;

    const staff = await this.prisma.client.vendorStaff.findFirst({
      where: { userId },
      include: { vendor: true },
    });
    if (staff?.vendor && !staff.vendor.deletedAt) return staff.vendor;

    throw new ForbiddenException("No vendor store linked to this account");
  }

  async getProfile(userId: string): Promise<VendorProfileDto> {
    const vendor = await this.resolveVendorForUser(userId);
    const [productCount, orderCount] = await Promise.all([
      this.prisma.client.product.count({
        where: { vendorId: vendor.id, deletedAt: null },
      }),
      this.prisma.client.orderItem.count({
        where: { vendorId: vendor.id },
      }),
    ]);

    return {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      description: vendor.description,
      logoUrl: vendor.logoUrl,
      rating: Number(vendor.rating),
      isVerified: vendor.isVerified,
      isActive: vendor.isActive,
      productCount,
      orderCount,
    };
  }

  async registerStore(
    userId: string,
    data: { storeName: string; description?: string },
  ): Promise<VendorProfileDto> {
    const existingOwner = await this.prisma.client.vendor.findFirst({
      where: { ownerId: userId },
    });
    if (existingOwner) {
      throw new ConflictException("You already have a vendor store");
    }

    const existingStaff = await this.prisma.client.vendorStaff.findFirst({
      where: { userId },
    });
    if (existingStaff) {
      throw new ConflictException("You are already linked to a vendor store");
    }

    let slug = slugify(data.storeName);
    const slugTaken = await this.prisma.client.vendor.findUnique({
      where: { slug },
    });
    if (slugTaken) slug = `${slug}-${Date.now().toString(36)}`;

    const vendorRole = await this.prisma.client.role.findUnique({
      where: { slug: "vendor" },
    });
    if (!vendorRole) {
      throw new ConflictException("Vendor role not seeded. Run: npm run db:seed");
    }

    await this.prisma.client.$transaction(async (tx) => {
      await tx.vendor.create({
        data: {
          id: uuidv7(),
          ownerId: userId,
          name: data.storeName,
          slug,
          description: data.description,
          isVerified: false,
          isActive: true,
        },
      });

      const hasRole = await tx.userRole.findUnique({
        where: { userId_roleId: { userId, roleId: vendorRole.id } },
      });
      if (!hasRole) {
        await tx.userRole.create({
          data: { userId, roleId: vendorRole.id },
        });
      }
    });

    return this.getProfile(userId);
  }

  async updateProfile(
    userId: string,
    data: { name?: string; description?: string; logoUrl?: string },
  ): Promise<VendorProfileDto> {
    const vendor = await this.resolveVendorForUser(userId);
    if (vendor.ownerId !== userId) {
      throw new ForbiddenException("Only the store owner can update profile");
    }

    await this.prisma.client.vendor.update({
      where: { id: vendor.id },
      data: {
        name: data.name,
        description: data.description,
        logoUrl: data.logoUrl,
      },
    });

    return this.getProfile(userId);
  }

  async getPublicStore(slug: string) {
    const vendor = await this.prisma.client.vendor.findFirst({
      where: { slug, isActive: true, deletedAt: null },
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
    if (!vendor) throw new NotFoundException("Vendor not found");

    return {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      description: vendor.description,
      logoUrl: vendor.logoUrl,
      rating: Number(vendor.rating),
      isVerified: vendor.isVerified,
      productCount: vendor._count.products,
    };
  }
}
