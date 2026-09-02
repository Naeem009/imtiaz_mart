import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type {
  AdminCustomerDto,
  AdminOrderDto,
  AdminProductDto,
  AdminSocialOverviewDto,
  AdminStatsDto,
  AdminVendorDto,
  AgentEligibilityProductDto,
  AgentFeedStatusDto,
  PaginatedResponse,
  PlatformSettingsDto,
} from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CatalogSearchService } from "@/modules/search/catalog-search.service";
import { RedisService } from "@/modules/redis/redis.module";

function adminSlugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private search: CatalogSearchService,
    private redis: RedisService,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [users, vendors, products, orders, revenue, pendingVendors] =
      await Promise.all([
        this.prisma.client.user.count({ where: { deletedAt: null } }),
        this.prisma.client.vendor.count({ where: { deletedAt: null } }),
        this.prisma.client.product.count({ where: { deletedAt: null } }),
        this.prisma.client.order.count(),
        this.prisma.client.order
          .aggregate({ _sum: { total: true } })
          .then((result) => Number(result._sum.total ?? 0)),
        this.prisma.client.vendor.count({
          where: { deletedAt: null, isVerified: false },
        }),
      ]);

    return { users, vendors, products, orders, revenue, pendingVendors };
  }

  async listVendors(): Promise<AdminVendorDto[]> {
    const vendors = await this.prisma.client.vendor.findMany({
      where: { deletedAt: null },
      include: {
        owner: { select: { email: true } },
        subscription: true,
        _count: {
          select: {
            products: { where: { deletedAt: null } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const orderCounts = await this.prisma.client.orderItem.groupBy({
      by: ["vendorId"],
      _count: { _all: true },
    });
    const orderMap = new Map(
      orderCounts.map((row) => [row.vendorId, row._count._all]),
    );

    return vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      isVerified: vendor.isVerified,
      isActive: vendor.isActive,
      rating: Number(vendor.rating),
      productCount: vendor._count.products,
      orderCount: orderMap.get(vendor.id) ?? 0,
      ownerEmail: vendor.owner?.email ?? null,
      createdAt: vendor.createdAt.toISOString(),
      subscriptionTier: vendor.subscription?.tier ?? "STARTER",
    }));
  }

  async listCategories() {
    return this.prisma.client.category.findMany({
      where: { deletedAt: null },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { products: { where: { deletedAt: null } } } }, parent: { select: { name: true } } },
    });
  }

  async createCategory(data: { name: string; description?: string; imageUrl?: string; sortOrder?: number; parentId?: string }) {
    return this.prisma.client.category.create({
      data: {
        name: data.name,
        slug: `${adminSlugify(data.name)}-${Date.now().toString(36)}`,
        description: data.description,
        imageUrl: data.imageUrl,
        sortOrder: data.sortOrder ?? 0,
        parentId: data.parentId,
      },
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; imageUrl?: string; sortOrder?: number; parentId?: string }) {
    const existing = await this.prisma.client.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException("Category not found");
    return this.prisma.client.category.update({
      where: { id },
      data: { ...data, ...(data.name ? { slug: `${adminSlugify(data.name)}-${id.slice(0, 8)}` } : {}) },
    });
  }

  async archiveCategory(id: string) {
    const existing = await this.prisma.client.category.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException("Category not found");
    const productCount = await this.prisma.client.product.count({ where: { categoryId: id, deletedAt: null } });
    if (productCount > 0) throw new NotFoundException("Move or archive this category's products first");
    await this.prisma.client.category.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: "Category archived" };
  }

  async createProduct(data: { name: string; categoryId: string; vendorId: string; price: number; compareAtPrice?: number; shortDescription?: string; description?: string; stock?: number; status?: ProductStatus; isEligibleSearch?: boolean; isEligibleCheckout?: boolean; imageUrl?: string }) {
    const product = await this.prisma.client.product.create({
      data: {
        id: uuidv7(), name: data.name, slug: `${adminSlugify(data.name)}-${Date.now().toString(36)}`,
        categoryId: data.categoryId, vendorId: data.vendorId, price: data.price, compareAtPrice: data.compareAtPrice,
        shortDescription: data.shortDescription, description: data.description, status: data.status ?? ProductStatus.DRAFT,
        isEligibleSearch: data.isEligibleSearch ?? true, isEligibleCheckout: data.isEligibleCheckout ?? false,
        variants: { create: { id: uuidv7(), name: "Default", price: data.price, compareAtPrice: data.compareAtPrice, stock: data.stock ?? 0 } },
        images: data.imageUrl ? { create: { id: uuidv7(), url: data.imageUrl, alt: data.name, isPrimary: true, sortOrder: 0 } } : undefined,
      },
    });
    await this.search.indexById(product.id);
    await this.redis.delByPrefix("catalog:");
    return product;
  }

  async updateProductDetails(id: string, data: { name?: string; categoryId?: string; vendorId?: string; price?: number; compareAtPrice?: number; shortDescription?: string; description?: string; stock?: number; status?: ProductStatus; isEligibleSearch?: boolean; isEligibleCheckout?: boolean }) {
    const existing = await this.prisma.client.product.findFirst({ where: { id, deletedAt: null }, include: { variants: true } });
    if (!existing) throw new NotFoundException("Product not found");
    const product = await this.prisma.client.product.update({ where: { id }, data: { name: data.name, categoryId: data.categoryId, vendorId: data.vendorId, price: data.price, compareAtPrice: data.compareAtPrice, shortDescription: data.shortDescription, description: data.description, status: data.status, isEligibleSearch: data.isEligibleSearch, isEligibleCheckout: data.isEligibleCheckout } });
    const variant = existing.variants[0];
    if (variant && (data.stock !== undefined || data.price !== undefined || data.compareAtPrice !== undefined)) {
      await this.prisma.client.productVariant.update({ where: { id: variant.id }, data: { stock: data.stock, price: data.price, compareAtPrice: data.compareAtPrice } });
    }
    await this.search.indexById(product.id);
    await this.redis.delByPrefix("catalog:");
    return product;
  }

  async archiveProduct(id: string) {
    const existing = await this.prisma.client.product.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundException("Product not found");
    await this.prisma.client.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED, deletedAt: new Date() } });
    await this.search.remove(id);
    await this.redis.delByPrefix("catalog:");
    return { message: "Product archived" };
  }

  async updateVendor(
    id: string,
    data: { isVerified?: boolean; isActive?: boolean },
  ) {
    return this.prisma.client.vendor.update({
      where: { id },
      data: {
        isVerified: data.isVerified,
        isActive: data.isActive,
      },
    });
  }

  async listOrders(page = 1): Promise<{
    data: AdminOrderDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const take = 20;
    const skip = (page - 1) * take;
    const [orders, total] = await Promise.all([
      this.prisma.client.order.findMany({
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.order.count(),
    ]);

    return {
      data: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
        currency: order.currency,
        customerName: order.shippingName,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.length,
      })),
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async listEligibility(): Promise<AgentEligibilityProductDto[]> {
    const products = await this.prisma.client.product.findMany({
      where: { deletedAt: null },
      include: { vendor: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      vendorName: product.vendor.name,
      isEligibleSearch: product.isEligibleSearch,
      isEligibleCheckout: product.isEligibleCheckout,
      status: product.status,
    }));
  }

  async updateEligibility(
    productId: string,
    data: { isEligibleSearch?: boolean; isEligibleCheckout?: boolean },
  ) {
    return this.prisma.client.product.update({
      where: { id: productId },
      data: {
        isEligibleSearch: data.isEligibleSearch,
        isEligibleCheckout: data.isEligibleCheckout,
      },
    });
  }

  async getFeedStatus(): Promise<AgentFeedStatusDto> {
    const count = await this.prisma.client.product.count({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        isEligibleSearch: true,
      },
    });
    const checkoutCount = await this.prisma.client.product.count({
      where: {
        status: ProductStatus.ACTIVE,
        deletedAt: null,
        isEligibleSearch: true,
        isEligibleCheckout: true,
      },
    });

    return {
      ucp: { count, path: "/feeds/ucp" },
      acp: { count: checkoutCount, path: "/feeds/acp" },
      perplexity: { count, path: "/feeds/perplexity" },
      updatedAt: new Date().toISOString(),
    };
  }

  async listSocialOverview(): Promise<AdminSocialOverviewDto> {
    const [accounts, rules, queue] = await Promise.all([
      this.prisma.client.vendorSocialAccount.findMany({
        include: { vendor: { select: { name: true, slug: true } } },
        orderBy: { connectedAt: "desc" },
        take: 50,
      }),
      this.prisma.client.socialAutomationRule.findMany({
        include: { vendor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      this.prisma.client.socialPostQueue.findMany({
        include: { rule: true, vendor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return {
      accounts: accounts.map((account) => ({
        id: account.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        isActive: account.isActive,
        vendorName: account.vendor.name,
      })),
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        triggers: rule.triggers,
        platforms: rule.platforms,
        enabled: rule.enabled,
        vendorName: rule.vendor.name,
      })),
      queue: queue.map((item) => ({
        id: item.id,
        status: item.status,
        vendorName: item.vendor.name,
        ruleName: item.rule?.name ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async listProducts(params: {
    page?: number;
    q?: string;
    status?: string;
  }): Promise<PaginatedResponse<AdminProductDto>> {
    const page = Math.max(1, params.page ?? 1);
    const take = 20;
    const skip = (page - 1) * take;
    const status = this.parseProductStatus(params.status);
    const q = params.q?.trim();

    const where = {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { slug: { contains: q, mode: "insensitive" as const } },
              { vendor: { name: { contains: q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.client.product.findMany({
        where,
        include: {
          vendor: { select: { name: true } },
          category: { select: { name: true } },
          variants: { select: { stock: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.product.count({ where }),
    ]);

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        status: product.status,
        price: Number(product.price),
        stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
        vendorName: product.vendor.name,
        categoryName: product.category.name,
        isEligibleSearch: product.isEligibleSearch,
        isEligibleCheckout: product.isEligibleCheckout,
        createdAt: product.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async updateProduct(
    id: string,
    data: {
      status?: ProductStatus;
      isEligibleSearch?: boolean;
      isEligibleCheckout?: boolean;
    },
  ): Promise<AdminProductDto> {
    const existing = await this.prisma.client.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Product not found");
    }

    const status = data.status;
    const product = await this.prisma.client.product.update({
      where: { id },
      data: {
        status,
        isEligibleSearch: data.isEligibleSearch,
        isEligibleCheckout: data.isEligibleCheckout,
        deletedAt:
          status === ProductStatus.ARCHIVED
            ? existing.deletedAt ?? new Date()
            : status
              ? null
              : undefined,
      },
      include: {
        vendor: { select: { name: true } },
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
    });

    await this.search.indexById(id);
    await this.redis.delByPrefix("catalog:");

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      status: product.status,
      price: Number(product.price),
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
      vendorName: product.vendor.name,
      categoryName: product.category.name,
      isEligibleSearch: product.isEligibleSearch,
      isEligibleCheckout: product.isEligibleCheckout,
      createdAt: product.createdAt.toISOString(),
    };
  }

  async listCustomers(params: {
    page?: number;
    q?: string;
  }): Promise<PaginatedResponse<AdminCustomerDto>> {
    const page = Math.max(1, params.page ?? 1);
    const take = 20;
    const skip = (page - 1) * take;
    const q = params.q?.trim();

    const where = {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { firstName: { contains: q, mode: "insensitive" as const } },
              { lastName: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.client.user.findMany({
        where,
        include: {
          roles: { include: { role: { select: { slug: true } } } },
          customer: { include: { _count: { select: { orders: true } } } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.client.user.count({ where }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        roles: user.roles.map((row) => row.role.slug),
        isActive: user.isActive,
        orderCount: user.customer?._count.orders ?? 0,
        createdAt: user.createdAt.toISOString(),
      })),
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async updateCustomer(id: string, data: { isActive: boolean }): Promise<AdminCustomerDto> {
    const existing = await this.prisma.client.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException("Customer not found");
    }

    const user = await this.prisma.client.user.update({
      where: { id },
      data: { isActive: data.isActive },
      include: {
        roles: { include: { role: { select: { slug: true } } } },
        customer: { include: { _count: { select: { orders: true } } } },
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      roles: user.roles.map((row) => row.role.slug),
      isActive: user.isActive,
      orderCount: user.customer?._count.orders ?? 0,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getSettings(): Promise<PlatformSettingsDto> {
    const rows = await this.prisma.client.platformSetting.findMany();
    const map = new Map(rows.map((row) => [row.key, row.value]));
    return {
      storeName: map.get("store_name") ?? DEFAULT_SETTINGS.storeName,
      supportEmail: map.get("support_email") ?? DEFAULT_SETTINGS.supportEmail,
      freeShippingThreshold: Number(
        map.get("free_shipping_threshold") ?? DEFAULT_SETTINGS.freeShippingThreshold,
      ),
      shippingFee: Number(map.get("shipping_fee") ?? DEFAULT_SETTINGS.shippingFee),
      platformFeeRate: Number(map.get("platform_fee_rate") ?? DEFAULT_SETTINGS.platformFeeRate),
      announcementText: map.get("announcement_text") ?? DEFAULT_SETTINGS.announcementText,
      announcementHref: map.get("announcement_href") ?? DEFAULT_SETTINGS.announcementHref,
    };
  }

  async updateSettings(data: Partial<PlatformSettingsDto>): Promise<PlatformSettingsDto> {
    const current = await this.getSettings();
    const next: PlatformSettingsDto = {
      storeName: data.storeName ?? current.storeName,
      supportEmail: data.supportEmail ?? current.supportEmail,
      freeShippingThreshold: data.freeShippingThreshold ?? current.freeShippingThreshold,
      shippingFee: data.shippingFee ?? current.shippingFee,
      platformFeeRate: data.platformFeeRate ?? current.platformFeeRate,
      announcementText: data.announcementText ?? current.announcementText,
      announcementHref: data.announcementHref ?? current.announcementHref,
    };

    const entries: Array<[string, string]> = [
      ["store_name", next.storeName],
      ["support_email", next.supportEmail],
      ["free_shipping_threshold", String(next.freeShippingThreshold)],
      ["shipping_fee", String(next.shippingFee)],
      ["platform_fee_rate", String(next.platformFeeRate)],
      ["announcement_text", next.announcementText],
      ["announcement_href", next.announcementHref],
    ];

    for (const [key, value] of entries) {
      await this.prisma.client.platformSetting.upsert({
        where: { key },
        update: { value },
        create: { id: uuidv7(), key, value },
      });
    }

    return next;
  }

  private parseProductStatus(value?: string): ProductStatus | undefined {
    if (!value) return undefined;
    return (Object.values(ProductStatus) as string[]).includes(value)
      ? (value as ProductStatus)
      : undefined;
  }
}

const DEFAULT_SETTINGS: PlatformSettingsDto = {
  storeName: "ATVOO",
  supportEmail: "support@example.com",
  freeShippingThreshold: 2999,
  shippingFee: 250,
  platformFeeRate: 0.1,
  announcementText: "Free shipping on orders over Rs. 2,999",
  announcementHref: "/deals",
};

