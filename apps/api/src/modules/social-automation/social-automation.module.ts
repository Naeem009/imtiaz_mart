import { Module } from "@nestjs/common";
import { SocialAutomationService } from "./social-automation.service";
import { SocialAutomationController } from "./social-automation.controller";
import { PrismaModule } from "@/modules/prisma/prisma.module";
import { VendorsModule } from "@/modules/vendors/vendors.module";
import { QueueService } from "./queue.service";
import { ProcessorService } from "./processor.service";
import { AutomationScheduler } from "./automation-scheduler.service";

@Module({
  imports: [PrismaModule, VendorsModule],
  providers: [SocialAutomationService, QueueService, ProcessorService, AutomationScheduler],
  controllers: [SocialAutomationController],
})
export class SocialAutomationModule {}
