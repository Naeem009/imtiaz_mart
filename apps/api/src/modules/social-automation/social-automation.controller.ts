import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { ConnectAccountDto } from "./dto/connect-account.dto";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { OAuthCallbackDto } from "./dto/oauth-callback.dto";
import { GeneratePostDto } from "./dto/generate-post.dto";
import { SocialAutomationService } from "./social-automation.service";

@ApiTags("vendor-social")
@ApiBearerAuth()
@Roles("vendor", "vendor_staff")
@Controller({ path: "vendor", version: API_VERSION })
export class SocialAutomationController {
  constructor(private service: SocialAutomationService) {}

  @Get("social-accounts")
  @ApiOperation({ summary: "List connected social accounts" })
  listAccounts(@CurrentUser() user: JwtPayload) {
    return this.service.listAccounts(user.sub);
  }

  @Post("social-accounts/connect")
  @ApiOperation({ summary: "Connect a social account (OAuth placeholder)" })
  connect(@CurrentUser() user: JwtPayload, @Body() body: ConnectAccountDto) {
    return this.service.connectAccount(
      user.sub,
      body.provider,
      body.providerAccountId,
      body.scopes,
    );
  }

  @Post("social-accounts/oauth")
  @ApiOperation({ summary: "Store OAuth tokens for a social account" })
  oauth(@CurrentUser() user: JwtPayload, @Body() body: OAuthCallbackDto) {
    return this.service.storeOAuthTokens(
      user.sub,
      body.provider,
      body.providerAccountId,
      body.accessToken,
      body.refreshToken,
    );
  }

  @Post("social-accounts/disconnect/:id")
  @ApiOperation({ summary: "Disconnect a social account" })
  disconnect(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.service.disconnectAccount(user.sub, id);
  }

  @Get("social-automation/rules")
  @ApiOperation({ summary: "List automation rules" })
  listRules(@CurrentUser() user: JwtPayload) {
    return this.service.listRules(user.sub);
  }

  @Post("social-automation/rules")
  @ApiOperation({ summary: "Create an automation rule" })
  createRule(@CurrentUser() user: JwtPayload, @Body() dto: CreateRuleDto) {
    return this.service.createRule(user.sub, dto);
  }

  @Post("social-automation/rules/:id/trigger")
  @ApiOperation({ summary: "Manually trigger an automation rule" })
  trigger(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.service.triggerRuleNow(user.sub, id);
  }

  @Get("social-automation/queue")
  @ApiOperation({ summary: "List social post approval queue" })
  queue(@CurrentUser() user: JwtPayload) {
    return this.service.listQueue(user.sub);
  }

  @Post("social-automation/queue/:id/approve")
  @ApiOperation({ summary: "Approve a queued social post" })
  approve(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.service.approveQueueItem(user.sub, id);
  }

  @Post("social-automation/queue/:id/reject")
  @ApiOperation({ summary: "Reject a queued social post" })
  reject(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.service.rejectQueueItem(user.sub, id);
  }

  @Post("social-automation/generate-post")
  @ApiOperation({ summary: "Generate an AI draft caption" })
  generate(
    @CurrentUser() user: JwtPayload,
    @Body() body: GeneratePostDto,
  ) {
    return this.service.generatePost(user.sub, body.productId);
  }

  @Get("social-automation/analytics")
  @ApiOperation({ summary: "Social automation performance" })
  analytics(@CurrentUser() user: JwtPayload) {
    return this.service.analytics(user.sub);
  }
}
