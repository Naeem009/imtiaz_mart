import { Module } from "@nestjs/common";
import { SocialAutomationService } from "./social-automation.service";
import { SocialAutomationController } from "./social-automation.controller";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { QueueService } from "./queue.service";
import { ProcessorService } from "./processor.service";

@Module({
  imports: [PrismaModule],
  providers: [SocialAutomationService, QueueService, ProcessorService],
  controllers: [SocialAutomationController],
})
export class SocialAutomationModule {}
