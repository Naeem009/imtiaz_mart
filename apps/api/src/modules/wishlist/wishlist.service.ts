import { Injectable, NotFoundException } from "@nestjs/common";
import type { WishlistItemDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  private async ensureWishlist(userId: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const existing = await this.prisma.client.wishlist.findUnique({
      where: { customerId: customer.id },
    });
    if (existing) return existing;
    return this.prisma.client.wishlist.create({
      data: { id: uuidv7(), customerId: customer.id },
    });
  }

  async list(userId: string): Promise<WishlistItemDto[]> {
    const wishlist = await this.ensureWishlist(userId);
    const items = await this.prisma.client.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } },
      orderBy: { createdAt: "desc" },
    });
    return items.map((item) => ({
      id: item.id,
      productId: item.productId,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        primaryImage:
          item.product.images.find((image) => image.isPrimary)?.url ??
          item.product.images[0]?.url ??
          null,
      },
      createdAt: item.createdAt.toISOString(),
    }));
  }

  async add(userId: string, productId: string) {
    const product = await this.prisma.client.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) throw new NotFoundException("Product not found");
    const wishlist = await this.ensureWishlist(userId);
    await this.prisma.client.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { id: uuidv7(), wishlistId: wishlist.id, productId },
      update: {},
    });
    return this.list(userId);
  }

  async remove(userId: string, productId: string) {
    const wishlist = await this.ensureWishlist(userId);
    await this.prisma.client.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
    return this.list(userId);
  }
}
