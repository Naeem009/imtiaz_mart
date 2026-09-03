import { Injectable, Logger } from "@nestjs/common";

type JobData = { queueId: string; vendorId: string; ruleId?: string; payload?: any };

@Injectable()
export class QueueService {
  private logger = new Logger(QueueService.name);
  private useBull = false;
  private bullQueue: any = null;
  private inMemoryHandlers: Array<(job: any) => Promise<void>> = [];

  constructor() {
    // Try to initialize BullMQ if available
    try {
      const { Queue } = require("bullmq");
      const connection = { connection: { host: process.env.REDIS_HOST ?? "127.0.0.1", port: Number(process.env.REDIS_PORT ?? 6379) } };
      this.bullQueue = new Queue("social-posts", connection);
      this.useBull = true;
      this.logger.log("Using BullMQ for social automation queue");
    } catch {
      this.logger.log("BullMQ not found; falling back to in-memory queue");
    }
  }

  async add(job: JobData) {
    if (this.useBull && this.bullQueue) {
      await this.bullQueue.add("post", job, { removeOnComplete: true, removeOnFail: 100 });
      return;
    }

    // in-memory: dispatch to handlers async
    setTimeout(() => {
      this.inMemoryHandlers.forEach((h) => void h({ data: job }));
    }, 50);
  }

  onProcess(fn: (job: any) => Promise<void>) {
    if (this.useBull) {
      try {
        const { Worker } = require("bullmq");
        // Worker will call the provided fn
        // Connection options mirror Queue above
        const worker = new Worker(
          "social-posts",
          async (job: any) => {
            await fn(job);
          },
          { connection: { host: process.env.REDIS_HOST ?? "127.0.0.1", port: Number(process.env.REDIS_PORT ?? 6379) } },
        );
        worker.on("failed", (job: any, err: any) => {
          this.logger.error(`Job failed ${job?.id}: ${err?.message}`);
        });
        this.logger.log("BullMQ worker started for social-posts");
        return;
      } catch {
        this.logger.warn("Failed to start BullMQ worker, falling back to in-memory handlers");
      }
    }

    this.inMemoryHandlers.push(fn);
  }
}
