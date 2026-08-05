import { Module } from "@nestjs/common";
import { AgentCommerceController } from "./agent-commerce.controller";
import { AgentCommerceService } from "./agent-commerce.service";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [AgentCommerceController],
  providers: [AgentCommerceService],
})
export class AgentCommerceModule {}
