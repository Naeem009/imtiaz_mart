import { Injectable } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AgentCommerceService {
  constructor(private prisma: PrismaService) {}

  private appUrl() {
    return process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";
  }

  async getManifest(appUrl: string) {
    const origin = appUrl || this.appUrl();
    const categories = await this.prisma.client.category.findMany({
      where: { deletedAt: null },
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });

    return {
      merchant_name: "ATVOO",
      merchant_url: origin,
      feeds: {
        ucp: `${origin}/feeds/ucp`,
        acp: `${origin}/feeds/acp`,
        perplexity: `${origin}/feeds/perplexity`,
      },
      policies: {
        terms_of_service: `${origin}/terms`,
        privacy_policy: `${origin}/privacy`,
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
    return `ATVOO is a premium multi-vendor marketplace offering trusted local sellers across electronics, fashion, home, beauty, and lifestyle.

Respond as a helpful shopping assistant. Only recommend products that are in stock and available for immediate delivery. Do not hallucinate prices or inventory status. Link users back to the product page for checkout when agentic purchase is not enabled.

Vendor policies: respect product eligibility flags, honor vendor shipping zones, and exclude restricted categories from agentic checkout unless explicitly approved by marketplace administration.`;
  }

  private catalogInclude() {
    return {
      category: true,
      brand: true,
      vendor: true,
      images: { orderBy: { sortOrder: "asc" as const } },
      variants: true,
    };
  }

  async getUcpFeed() {
    const origin = this.appUrl();
    const products = await this.prisma.client.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        isEligibleSearch: true,
      },
      include: this.catalogInclude(),
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${origin}/products/${product.slug}`,
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
        search: product.isEligibleSearch,
        checkout: product.isEligibleCheckout,
      },
    }));
  }

  async getAcpFeed() {
    const origin = this.appUrl();
    const products = await this.prisma.client.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        isEligibleSearch: true,
        isEligibleCheckout: true,
      },
      include: this.catalogInclude(),
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${origin}/products/${product.slug}`,
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
        search: product.isEligibleSearch,
        checkout: product.isEligibleCheckout,
      },
      payment_rails: product.isEligibleCheckout ? ["stripe"] : [],
    }));
  }

  async getPerplexityFeed() {
    const origin = this.appUrl();
    const products = await this.prisma.client.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        isEligibleSearch: true,
      },
      include: this.catalogInclude(),
      orderBy: [{ updatedAt: "desc" }],
      take: 500,
    });

    return products.map((product) => ({
      id: product.id,
      title: product.name,
      description: product.shortDescription ?? product.description ?? "",
      link: `${origin}/products/${product.slug}`,
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
      payment_url: product.isEligibleCheckout
        ? `${origin}/checkout?product=${product.id}`
        : `${origin}/products/${product.slug}`,
    }));
  }
}
