import { Injectable } from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import type {
  AdminOrderDto,
  AdminSocialOverviewDto,
  AdminStatsDto,
  AdminVendorDto,
  AgentEligibilityProductDto,
  AgentFeedStatusDto,
} from "@imtiaz-mart/shared";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

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
}
