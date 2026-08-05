import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class SocialAutomationService {
  private readonly logger = new Logger(SocialAutomationService.name);

  constructor(private prisma: PrismaService) {}

  async listAccounts(vendorId: string) {
    return (this.prisma as any).vendorSocialAccount.findMany({ where: { vendorId } });
  }

  async connectAccount(vendorId: string, provider: string, providerAccountId: string, scopes: string[]) {
    const account = await (this.prisma as any).vendorSocialAccount.upsert({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      create: { vendorId, provider, providerAccountId, scopes },
      update: { scopes, isActive: true },
    });
    return account;
  }

  async disconnectAccount(id: string) {
    return (this.prisma as any).vendorSocialAccount.update({ where: { id }, data: { isActive: false } });
  }

  async listRules(vendorId: string) {
    return (this.prisma as any).socialAutomationRule.findMany({ where: { vendorId } });
  }

  async createRule(vendorId: string, data: { name: string; triggers: string[]; platforms: string[]; config?: any }) {
    return (this.prisma as any).socialAutomationRule.create({ data: { vendorId, name: data.name, triggers: data.triggers, platforms: data.platforms, config: data.config } });
  }

  async triggerRuleNow(vendorId: string, ruleId: string) {
    // enqueue a SocialPostQueue entry — worker will process later
    const queue = await (this.prisma as any).socialPostQueue.create({ data: { vendorId, ruleId, payload: {}, status: "PENDING" } as any });
    this.logger.log(`Enqueued social post queue ${queue.id} for vendor ${vendorId}`);
    return queue;
  }
}
