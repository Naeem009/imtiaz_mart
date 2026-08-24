import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { getAdapter } from "./adapters";

@Injectable()
export class ProcessorService implements OnModuleInit {
  private logger = new Logger(ProcessorService.name);

  constructor(
    private queue: QueueService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.queue.onProcess(async (job) => {
      await this.handleJob(job.data);
    });
  }

  async handleJob(data: {
    queueId: string;
    vendorId: string;
    ruleId?: string;
    payload?: Record<string, unknown>;
  }) {
    const { queueId, vendorId, ruleId } = data;
    this.logger.log(`Processing social job ${queueId} vendor=${vendorId} rule=${ruleId}`);

    try {
      await this.prisma.client.socialPostQueue.update({
        where: { id: queueId },
        data: { status: "SCHEDULED" },
      });
    } catch (err: unknown) {
      this.logger.warn(`Failed to mark queue ${queueId} scheduled: ${String(err)}`);
    }

    try {
      const rule = ruleId
        ? await this.prisma.client.socialAutomationRule.findUnique({ where: { id: ruleId } })
        : null;
      const vendor = await this.prisma.client.vendor.findUnique({ where: { id: vendorId } });
      const platforms = rule?.platforms?.length ? rule.platforms : ["facebook"];
      const caption = `Check out new items from ${vendor?.name ?? "our store"} on ATVOO!`;

      const banned = ["spam", "banned"];
      const blocked = banned.some((word) => caption.toLowerCase().includes(word));
      if (blocked) {
        await this.prisma.client.socialContentModerationLog.create({
          data: { queueId, verdict: "REJECT", reason: "Contains banned terms" },
        });
        await this.prisma.client.socialPostQueue.update({
          where: { id: queueId },
          data: { status: "FAILED" },
        });
        return;
      }

      await this.prisma.client.socialContentModerationLog.create({
        data: { queueId, verdict: "ALLOW", reason: "Passed brand-safety screen" },
      });

      for (const platform of platforms) {
        try {
          const Adapter = getAdapter(platform);
          let result: { platformPostId: string | null; response: unknown } = {
            platformPostId: null,
            response: { skipped: true },
          };
          if (Adapter) {
            const account = await this.prisma.client.vendorSocialAccount.findFirst({
              where: { vendorId, provider: platform, isActive: true },
            });
            if (!account) {
              result = {
                platformPostId: null,
                response: { skipped: true, reason: "No connected account" },
              };
            } else {
              const adapter = new Adapter(this.prisma.client);
              const payload = data.payload ?? {};
              result = await adapter.publish(account, {
                productId: typeof payload.productId === "string" ? payload.productId : "",
                productUrl: typeof payload.productUrl === "string" ? payload.productUrl : undefined,
                imageUrl: typeof payload.imageUrl === "string" ? payload.imageUrl : undefined,
                title: caption,
              });
            }
          }
          await this.prisma.client.socialPost.create({
            data: {
              vendorId,
              queueId,
              platform,
              status: "SENT",
              publishedAt: new Date(),
              response: result.response as object,
              platformPostId: result.platformPostId,
            },
          });
        } catch (err: unknown) {
          this.logger.error(`Failed publish to ${platform}: ${String(err)}`);
          await this.prisma.client.socialPost.create({
            data: {
              vendorId,
              queueId,
              platform,
              status: "FAILED",
              response: { error: String(err) },
            },
          });
        }
      }

      await this.prisma.client.socialPostQueue.update({
        where: { id: queueId },
        data: { status: "SENT" },
      });
    } catch (err: unknown) {
      this.logger.error(`Processor error for ${queueId}: ${String(err)}`);
      await this.prisma.client.socialPostQueue.update({
        where: { id: queueId },
        data: { status: "FAILED" },
      }).catch(() => undefined);
    }
  }
}
