import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AgentCommerceService {
  constructor(private prisma: PrismaService) {}

  async getManifest(appUrl: string) {
    const categories = await this.prisma.client.category.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });

    return {
      merchant_name: "ATVOO",
      merchant_url: appUrl,
      feeds: {
        ucp: `${appUrl}/feeds/ucp`,
        acp: `${appUrl}/feeds/acp`,
        perplexity: `${appUrl}/feeds/perplexity`,
      },
      policies: {
        terms_of_service: `${appUrl}/terms`,
        privacy_policy: `${appUrl}/privacy`,
      },
      supported_currencies: ["PKR"],
      catalog: categories.map((category) => ({
        id: category.slug,
        name: category.name,
      })),
      updated_at: new Date().toISOString(),
    };
  }

  async getLlmInstructions() {
    return `Atvoo is a premium multi-vendor marketplace offering trusted local sellers across electronics, fashion, home, beauty, and lifestyle.\n\nRespond as a helpful shopping assistant. Only recommend products that are in stock and available for immediate delivery. Do not hallucinate prices or inventory status. Link users back to the product page for checkout when agentic purchase is not enabled.\n\nVendor policies: respect product eligibility flags, honor vendor shipping zones, and exclude restricted categories from agentic checkout unless explicitly approved by marketplace administration.`;
  }

  private toProductItem(product: any) {
    const primaryImage =
      product.images.find((image: any) => image.isPrimary) ?? product.images[0];

    return {
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${process.env.APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
      image_link: primaryImage?.url ?? null,
      price: product.price.toString(),
      currency: "PKR",
      availability: product.stock > 0 ? "in stock" : "out of stock",
      brand: product.brand?.name ?? "",
      category: product.category.name,
      sku: product.sku ?? product.id,
      gtin: null,
      is_eligible_search: true,
      is_eligible_checkout: true,
    };
  }

  async getUcpFeed() {
    const products = await this.prisma.client.product.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        category: true,
        brand: true,
        vendor: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${process.env.APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
      images: product.images.map((image) => image.url),
      price: product.price.toString(),
      currency: "PKR",
      availability: product.variants.some((variant) => variant.stock > 0)
        ? "in stock"
        : "out of stock",
      brand: product.brand?.name ?? "",
      category: product.category.name,
      vendor: {
        id: product.vendor.id,
        name: product.vendor.name,
      },
      sku: product.sku ?? product.id,
      gtin: null,
      eligibility: {
        search: true,
        checkout: true,
      },
    }));
  }

  async getAcpFeed() {
    const products = await this.prisma.client.product.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${process.env.APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
      image: product.images[0]?.url ?? null,
      price: {
        amount: product.price.toString(),
        currency: "PKR",
      },
      sku: product.sku ?? product.id,
      category: product.category.name,
      brand: product.brand?.name ?? "",
      availability: product.variants.some((variant) => variant.stock > 0)
        ? "in stock"
        : "out of stock",
      eligibility: {
        search: true,
        checkout: true,
      },
      payment_rails: ["strip"],
    }));
  }

  async getPerplexityFeed() {
    const products = await this.prisma.client.product.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: true,
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${process.env.APP_URL ?? "http://localhost:3000"}/products/${product.slug}`,
      image_link: product.images[0]?.url ?? null,
      price: `${product.price.toString()} PKR`,
      availability: product.variants.some((variant) => variant.stock > 0)
        ? "in stock"
        : "out of stock",
      brand: product.brand?.name ?? "",
      category: product.category.name,
      sku: product.sku ?? product.id,
      gtin: null,
      seller: "ATVOO",
      payment_url: `${process.env.APP_URL ?? "http://localhost:3000"}/checkout?product=${product.id}`,
    }));
  }
}
