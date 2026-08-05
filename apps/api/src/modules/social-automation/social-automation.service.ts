import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { QueueService } from "./queue.service";

@Injectable()
export class SocialAutomationService {
  private readonly logger = new Logger(SocialAutomationService.name);

  constructor(private prisma: PrismaService, private queue: QueueService) {}

  async listAccounts(vendorId: string) {
    return (this.prisma.client as any).vendorSocialAccount.findMany({ where: { vendorId } });
  }

  async connectAccount(vendorId: string, provider: string, providerAccountId: string, scopes: string[]) {
    const account = await (this.prisma.client as any).vendorSocialAccount.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      create: { vendorId, provider, providerAccountId, scopes },
      update: { scopes, isActive: true },
    });
    return account;
  }

    async storeOAuthTokens(vendorId: string, provider: string, providerAccountId: string, accessToken?: string, refreshToken?: string) {
      // encrypt tokens and store on the vendorSocialAccount row
      const { encryptText } = require("@/lib/crypto");
      const data: any = {};
      if (accessToken) data.accessToken = encryptText(accessToken);
      if (refreshToken) data.refreshToken = encryptText(refreshToken);

      const account = await (this.prisma.client as any).vendorSocialAccount.upsert({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        create: { vendorId, provider, providerAccountId, scopes: [], isActive: true, accessToken: data.accessToken, refreshToken: data.refreshToken },
        update: { accessToken: data.accessToken, refreshToken: data.refreshToken, isActive: true },
      } as any);

      return account;
    }
  async disconnectAccount(id: string) {
    return (this.prisma.client as any).vendorSocialAccount.update({ where: { id }, data: { isActive: false } });
  }

  async listRules(vendorId: string) {
    return (this.prisma.client as any).socialAutomationRule.findMany({ where: { vendorId } });
  }

  async createRule(vendorId: string, data: { name: string; triggers: string[]; platforms: string[]; config?: any }) {
    return (this.prisma.client as any).socialAutomationRule.create({ data: { vendorId, name: data.name, triggers: data.triggers, platforms: data.platforms, config: data.config } });
  }

  async triggerRuleNow(vendorId: string, ruleId: string) {
    // enqueue a SocialPostQueue entry — worker will process later
    const queue = await (this.prisma.client as any).socialPostQueue.create({ data: { vendorId, ruleId, payload: {}, status: "PENDING" } as any });
    this.logger.log(`Enqueued social post queue ${queue.id} for vendor ${vendorId}`);
    // add to background queue
    await this.queue.add({ queueId: queue.id, vendorId, ruleId, payload: {} });
    return queue;
  }
}
