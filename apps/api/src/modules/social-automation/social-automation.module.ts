import { Module } from "@nestjs/common";
import { SocialAutomationService } from "./social-automation.service";
import { SocialAutomationController } from "./social-automation.controller";
import { PrismaModule } from "@/modules/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [SocialAutomationService],
  controllers: [SocialAutomationController],
})
export class SocialAutomationModule {}
