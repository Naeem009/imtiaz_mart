import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { QueueService } from "./queue.service";

const DEFAULT_INTERVAL_MS = Number(process.env.SOCIAL_AUTOMATION_INTERVAL_MS ?? 20 * 60 * 1000);
const SITE_URL = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

@Injectable()
export class AutomationScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutomationScheduler.name);
  private handle: NodeJS.Timeout | null = null;

  constructor(private prisma: PrismaService, private queue: QueueService) {}

  async onModuleInit() {
    this.logger.log(`Starting automation scheduler: interval=${DEFAULT_INTERVAL_MS}ms`);
    // run immediately then every interval
    await this.scanAndEnqueue();
    this.handle = setInterval(() => void this.scanAndEnqueue(), DEFAULT_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.handle) clearInterval(this.handle);
  }

  async scanAndEnqueue() {
    try {
      // Find rules that are enabled and meant for auto-publish (config.autoPublish === true)
      const rules = await (this.prisma.client as any).socialAutomationRule.findMany({ where: { enabled: true } });

      for (const rule of rules) {
        try {
          const vendorId = rule.vendorId;

          // Check vendor subscription (skip STARTER)
          const sub = await (this.prisma.client as any).vendorSubscription.findUnique({ where: { vendorId } });
          if (sub && sub.tier === "STARTER") {
            this.logger.log(`Skipping vendor ${vendorId} due to subscription tier STARTER`);
            continue;
          }

          const autoPublish = rule?.config?.autoPublish ?? true; // default to true for rules
          if (!autoPublish) continue;

          // Find connected social accounts for this vendor
          const accounts = await (this.prisma.client as any).vendorSocialAccount.findMany({ where: { vendorId, isActive: true } });
          if (!accounts || accounts.length === 0) continue;

          // Pick a candidate product for the vendor: newest ACTIVE product
          const product = await (this.prisma.client as any).product.findFirst({ where: { vendorId, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
          if (!product) continue;

          // pick primary image
          const image = await (this.prisma.client as any).productImage.findFirst({ where: { productId: product.id }, orderBy: { sortOrder: "asc" } });
          const productUrl = `${SITE_URL}/products/${product.slug}`;

          // create a queue entry per account/platform defined in rule.platforms or all accounts
          const platforms: string[] = rule.platforms?.length ? rule.platforms : accounts.map((a: any) => a.provider);

          // enforce daily cap: rule.config.maxPerDay or default 72
          const maxPerDay = rule?.config?.maxPerDay ?? 72;
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
          const recentCount = await (this.prisma.client as any).socialPost.count({ where: { vendorId, createdAt: { gte: since.toISOString() } } });
          if (recentCount >= maxPerDay) {
            this.logger.log(`Vendor ${vendorId} reached daily post cap (${recentCount}/${maxPerDay}), skipping`);
            continue;
          }

          // check blackout hours
          const blackout = rule?.config?.blackoutHours ?? null; // expected { start: "22:00", end: "06:00" }
          if (blackout) {
            const now = new Date();
            const [startH, startM] = (blackout.start || "0:00").split(":" as any).map(Number);
            const [endH, endM] = (blackout.end || "0:00").split(":" as any).map(Number);
            const start = new Date();
            start.setHours(startH, startM, 0, 0);
            const end = new Date();
            end.setHours(endH, endM, 0, 0);
            let inBlackout = false;
            if (start < end) {
              inBlackout = now >= start && now <= end;
            } else {
              // spans midnight
              inBlackout = now >= start || now <= end;
            }
            if (inBlackout) {
              this.logger.log(`Current time is within blackout hours for vendor ${vendorId}, skipping`);
              continue;
            }
          }

          for (const platform of platforms) {
            try {
              const queue = await (this.prisma.client as any).socialPostQueue.create({ data: { vendorId, ruleId: rule.id, payload: { productId: product.id, productUrl, imageUrl: image?.url ?? null, title: product.name }, status: "PENDING" } as any });
              await this.queue.add({ queueId: queue.id, vendorId, ruleId: rule.id, payload: queue.payload });
              this.logger.log(`Enqueued auto post ${queue.id} for vendor ${vendorId} platform=${platform}`);
            } catch (err) {
              this.logger.error(`Failed to enqueue for vendor ${vendorId} platform=${platform}: ${String(err)}`);
            }
          }
        } catch (err) {
          this.logger.error(`Error processing rule ${rule.id}: ${String(err)}`);
        }
      }
    } catch (err) {
      this.logger.error(`Automation scan failed: ${String(err)}`);
    }
  }
}
