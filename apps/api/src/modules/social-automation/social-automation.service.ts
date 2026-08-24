import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SubscriptionTier } from "@imtiaz-mart/database";
import { v7 as uuidv7 } from "uuid";
import { encryptText } from "@/lib/crypto";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { VendorsService } from "@/modules/vendors/vendors.service";
import { QueueService } from "./queue.service";

const TIER_RANK: Record<SubscriptionTier, number> = {
  STARTER: 0,
  GROWTH: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
};

@Injectable()
export class SocialAutomationService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private vendors: VendorsService,
  ) {}

  private async requireVendor(userId: string) {
    return this.vendors.resolveVendorForUser(userId);
  }

  private async assertTier(vendorId: string, min: SubscriptionTier) {
    const tier = await this.vendors.getSubscriptionTier(vendorId);
    if (TIER_RANK[tier] < TIER_RANK[min]) {
      throw new ForbiddenException(
        `Social automation requires a ${min} plan or higher. Current plan: ${tier}.`,
      );
    }
    return tier;
  }

  async listAccounts(userId: string) {
    const vendor = await this.requireVendor(userId);
    const accounts = await this.prisma.client.vendorSocialAccount.findMany({
      where: { vendorId: vendor.id },
      orderBy: { connectedAt: "desc" },
    });
    return accounts.map((account) => ({
      id: account.id,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      isActive: account.isActive,
      scopes: account.scopes,
      connectedAt: account.connectedAt.toISOString(),
    }));
  }

  async connectAccount(
    userId: string,
    provider: string,
    providerAccountId: string,
    scopes: string[],
  ) {
    const vendor = await this.requireVendor(userId);
    const account = await this.prisma.client.vendorSocialAccount.upsert({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      create: {
        id: uuidv7(),
        vendorId: vendor.id,
        provider,
        providerAccountId,
        scopes,
        isActive: true,
      },
      update: {
        vendorId: vendor.id,
        scopes,
        isActive: true,
      },
    });
    return {
      id: account.id,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      isActive: account.isActive,
      scopes: account.scopes,
      connectedAt: account.connectedAt.toISOString(),
    };
  }

  async storeOAuthTokens(
    userId: string,
    provider: string,
    providerAccountId: string,
    accessToken?: string,
    refreshToken?: string,
  ) {
    const vendor = await this.requireVendor(userId);
    const account = await this.prisma.client.vendorSocialAccount.upsert({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
      create: {
        id: uuidv7(),
        vendorId: vendor.id,
        provider,
        providerAccountId,
        scopes: [],
        isActive: true,
        accessToken: accessToken ? encryptText(accessToken) : undefined,
        refreshToken: refreshToken ? encryptText(refreshToken) : undefined,
      },
      update: {
        accessToken: accessToken ? encryptText(accessToken) : undefined,
        refreshToken: refreshToken ? encryptText(refreshToken) : undefined,
        isActive: true,
      },
    });
    return { id: account.id, provider: account.provider, isActive: account.isActive };
  }

  async disconnectAccount(userId: string, id: string) {
    const vendor = await this.requireVendor(userId);
    const existing = await this.prisma.client.vendorSocialAccount.findFirst({
      where: { id, vendorId: vendor.id },
    });
    if (!existing) throw new NotFoundException("Social account not found");
    return this.prisma.client.vendorSocialAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async listRules(userId: string) {
    const vendor = await this.requireVendor(userId);
    const rules = await this.prisma.client.socialAutomationRule.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: "desc" },
    });
    return rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      triggers: rule.triggers,
      platforms: rule.platforms,
      enabled: rule.enabled,
      createdAt: rule.createdAt.toISOString(),
    }));
  }

  async createRule(
    userId: string,
    data: { name: string; triggers: string[]; platforms: string[]; config?: unknown },
  ) {
    const vendor = await this.requireVendor(userId);
    await this.assertTier(vendor.id, SubscriptionTier.GROWTH);
    const rule = await this.prisma.client.socialAutomationRule.create({
      data: {
        id: uuidv7(),
        vendorId: vendor.id,
        name: data.name,
        triggers: data.triggers,
        platforms: data.platforms,
        config: data.config as object | undefined,
      },
    });
    return {
      id: rule.id,
      name: rule.name,
      triggers: rule.triggers,
      platforms: rule.platforms,
      enabled: rule.enabled,
      createdAt: rule.createdAt.toISOString(),
    };
  }

  async listQueue(userId: string) {
    const vendor = await this.requireVendor(userId);
    const items = await this.prisma.client.socialPostQueue.findMany({
      where: { vendorId: vendor.id },
      include: { rule: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return items.map((item) => ({
      id: item.id,
      status: item.status,
      payload: item.payload,
      scheduledAt: item.scheduledAt?.toISOString() ?? null,
      createdAt: item.createdAt.toISOString(),
      ruleName: item.rule?.name ?? null,
    }));
  }

  async approveQueueItem(userId: string, id: string) {
    const vendor = await this.requireVendor(userId);
    const item = await this.prisma.client.socialPostQueue.findFirst({
      where: { id, vendorId: vendor.id },
    });
    if (!item) throw new NotFoundException("Queue item not found");
    await this.queue.add({
      queueId: item.id,
      vendorId: vendor.id,
      ruleId: item.ruleId ?? undefined,
      payload: item.payload,
    });
    return this.prisma.client.socialPostQueue.update({
      where: { id },
      data: { status: "SCHEDULED" },
    });
  }

  async rejectQueueItem(userId: string, id: string) {
    const vendor = await this.requireVendor(userId);
    const item = await this.prisma.client.socialPostQueue.findFirst({
      where: { id, vendorId: vendor.id },
    });
    if (!item) throw new NotFoundException("Queue item not found");
    return this.prisma.client.socialPostQueue.update({
      where: { id },
      data: { status: "FAILED" },
    });
  }

  async generatePost(userId: string, productId?: string) {
    const vendor = await this.requireVendor(userId);
    await this.assertTier(vendor.id, SubscriptionTier.GROWTH);
    const product = productId
      ? await this.prisma.client.product.findFirst({
          where: { id: productId, vendorId: vendor.id },
        })
      : await this.prisma.client.product.findFirst({
          where: { vendorId: vendor.id, status: "ACTIVE", deletedAt: null },
        });

    const caption = product
      ? `New from ${vendor.name}: ${product.name}. Shop now on ATVOO.`
      : `Discover new arrivals from ${vendor.name} on ATVOO.`;

    return {
      caption,
      hashtags: ["#ATVOO", "#ShopLocal", "#Marketplace"],
      productId: product?.id ?? null,
    };
  }

  async triggerRuleNow(userId: string, ruleId: string) {
    const vendor = await this.requireVendor(userId);
    await this.assertTier(vendor.id, SubscriptionTier.GROWTH);
    const rule = await this.prisma.client.socialAutomationRule.findFirst({
      where: { id: ruleId, vendorId: vendor.id },
    });
    if (!rule) throw new NotFoundException("Automation rule not found");

    const queue = await this.prisma.client.socialPostQueue.create({
      data: {
        id: uuidv7(),
        vendorId: vendor.id,
        ruleId: rule.id,
        payload: { trigger: "Manual", vendorName: vendor.name },
        status: "PENDING",
      },
    });
    await this.queue.add({
      queueId: queue.id,
      vendorId: vendor.id,
      ruleId: rule.id,
      payload: queue.payload,
    });
    return queue;
  }

  async analytics(userId: string) {
    const vendor = await this.requireVendor(userId);
    const [sent, failed, queued, accounts] = await Promise.all([
      this.prisma.client.socialPost.count({
        where: { vendorId: vendor.id, status: "SENT" },
      }),
      this.prisma.client.socialPost.count({
        where: { vendorId: vendor.id, status: "FAILED" },
      }),
      this.prisma.client.socialPostQueue.count({
        where: { vendorId: vendor.id, status: { in: ["PENDING", "SCHEDULED"] } },
      }),
      this.prisma.client.vendorSocialAccount.count({
        where: { vendorId: vendor.id, isActive: true },
      }),
    ]);
    return { sent, failed, queued, accounts };
  }
}
