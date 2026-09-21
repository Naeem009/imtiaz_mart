import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { prisma, PrismaClient } from "@imtiaz-mart/database";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client: PrismaClient = prisma;

  async onModuleInit() {
    try {
      await this.client.$connect();
    } catch (error) {
      this.logger.error(`Prisma connect failed: ${String(error)}`);
    }
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
