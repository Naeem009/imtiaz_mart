import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { QueueService } from "./queue.service";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class ProcessorService implements OnModuleInit {
  private logger = new Logger(ProcessorService.name);

  constructor(private queue: QueueService, private prisma: PrismaService) {}

  onModuleInit() {
    this.queue.onProcess(async (job) => {
      await this.handleJob(job.data);
    });
  }

  async handleJob(data: { queueId: string; vendorId: string; ruleId?: string; payload?: any }) {
    const { queueId, vendorId, ruleId } = data;
    this.logger.log(`Processing social job ${queueId} vendor=${vendorId} rule=${ruleId}`);

    // Mark queued record as processing
    try {
      await (this.prisma.client as any).socialPostQueue.update({ where: { id: queueId }, data: { status: "SCHEDULED" } });
    } catch (err) {
      this.logger.warn(`Failed to mark queue ${queueId} scheduled: ${String(err)}`);
    }

    // Simple placeholder: generate a caption, run moderation, publish to platforms
    try {
      // Load rule to determine platforms
      const rule = await (this.prisma.client as any).socialAutomationRule.findUnique({ where: { id: ruleId } });
      const vendor = await this.prisma.client.vendor.findUnique({ where: { id: vendorId } });

      const platforms = rule?.platforms ?? ["facebook"];

      // Build a simple payload — in real system, call AI content generation
      const caption = `Check out new items from ${vendor?.name ?? "our store"}!`;

      // Simple moderation: reject if caption contains a banned word
      const banned = ["spam", "banned"];
      const lower = caption.toLowerCase();
      const blocked = banned.some((w) => lower.includes(w));
      if (blocked) {
        await (this.prisma.client as any).socialContentModerationLog.create({ data: { queueId, verdict: "REJECT", reason: "Contains banned terms" } });
        await (this.prisma.client as any).socialPostQueue.update({ where: { id: queueId }, data: { status: "FAILED" } });
        this.logger.warn(`Job ${queueId} blocked by moderation`);
        return;
      }

      // Publish per platform (stub)
      for (const platform of platforms) {
        try {
          // In a production system this would call the platform adapter
          this.logger.log(`Publishing to ${platform} — ${caption}`);
          // Record a SocialPost row
          await (this.prisma.client as any).socialPost.create({ data: { vendorId, queueId, platform, status: "SENT", response: {}, platformPostId: null } });
        } catch (err) {
          this.logger.error(`Failed publish to ${platform}: ${String(err)}`);
          await (this.prisma.client as any).socialPost.create({ data: { vendorId, queueId, platform, status: "FAILED", response: { error: String(err) } } });
        }
      }

      await (this.prisma.client as any).socialPostQueue.update({ where: { id: queueId }, data: { status: "SENT" } });
    } catch (err) {
      this.logger.error(`Processor error for ${queueId}: ${String(err)}`);
      try {
        await (this.prisma.client as any).socialPostQueue.update({ where: { id: queueId }, data: { status: "FAILED" } });
      } catch {}
    }
  }
}
