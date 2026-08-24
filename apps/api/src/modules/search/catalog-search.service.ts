import { Injectable } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { ElasticsearchService } from "./elasticsearch.service";

@Injectable()
export class CatalogSearchService {
  constructor(
    private prisma: PrismaService,
    private elasticsearch: ElasticsearchService,
  ) {}

  async searchProductIds(query: string): Promise<string[] | null> {
    return this.elasticsearch.searchIds(query);
  }

  async indexById(productId: string) {
    const product = await this.prisma.client.product.findUnique({
      where: { id: productId },
      include: { category: true, brand: true, vendor: true },
    });
    if (!product) return;
    await this.elasticsearch.indexProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      category: product.category.slug,
      brand: product.brand?.slug ?? null,
      vendor: product.vendor.slug,
      price: Number(product.price),
      rating: Number(product.rating),
      status: product.status,
    });
  }

  async remove(productId: string) {
    await this.elasticsearch.removeProduct(productId);
  }

  async reindexAll() {
    const ready = await this.elasticsearch.ensureIndex();
    if (!ready) {
      return { indexed: 0, engine: "postgresql" as const };
    }
    const products = await this.prisma.client.product.findMany({
      where: { deletedAt: null, status: ProductStatus.ACTIVE },
      include: { category: true, brand: true, vendor: true },
    });
    for (const product of products) {
      await this.elasticsearch.indexProduct({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        category: product.category.slug,
        brand: product.brand?.slug ?? null,
        vendor: product.vendor.slug,
        price: Number(product.price),
        rating: Number(product.rating),
        status: product.status,
      });
    }
    return { indexed: products.length, engine: "elasticsearch" as const };
  }
}
