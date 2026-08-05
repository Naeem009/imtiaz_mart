import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class FeedsService {
  constructor(private prisma: PrismaService) {}

  async getUcpFeed() {
    const products = await this.prisma.client.product.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
        vendor: true,
      },
    });

    return products.map((p) => {
      const primaryImage = p.images.find((i) => i.isPrimary)?.url ?? p.images[0]?.url ?? null;
      const variant = p.variants[0];
      const availability = variant?.stock && variant.stock > 0 ? "in_stock" : "out_of_stock";

      return {
        id: p.id,
        sku: variant?.id ?? null,
        title: p.name,
        description: p.shortDescription ?? p.description ?? null,
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/products/${p.slug}`,
        price: variant?.price ?? p.price,
        currency: "USD",
        availability,
        images: p.images.map((i) => i.url),
        brand: p.brand?.name ?? null,
        category: p.category?.name ?? null,
        isEligibleSearch: p.isEligibleSearch,
        isEligibleCheckout: p.isEligibleCheckout,
      };
    });
  }
}
