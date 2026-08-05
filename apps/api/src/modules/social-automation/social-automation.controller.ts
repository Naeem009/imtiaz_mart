import { Body, Controller, Get, Post, Param, UseGuards, Req } from "@nestjs/common";
import { SocialAutomationService } from "./social-automation.service";
import { ConnectAccountDto } from "./dto/connect-account.dto";
import { CreateRuleDto } from "./dto/create-rule.dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { OAuthCallbackDto } from "./dto/oauth-callback.dto";

// NOTE: In production, OAuth flows should be implemented with proper redirects and CSRF protection.

@UseGuards(JwtAuthGuard)
@Controller("/social")
export class SocialAutomationController {
  constructor(private service: SocialAutomationService) {}

  @Get("/accounts")
  async listAccounts(@Req() req: any) {
    const vendorId = req.user?.vendorId;
    return this.service.listAccounts(vendorId);
  }

  @Post("/connect")
  async connect(@Req() req: any, @Body() body: ConnectAccountDto) {
    const vendorId = req.user?.vendorId;
    return this.service.connectAccount(vendorId, body.provider, body.providerAccountId, body.scopes);
  }

  @Post("/oauth/callback")
  async oauthCallback(@Req() req: any, @Body() body: OAuthCallbackDto) {
    const vendorId = req.user?.vendorId;
    return this.service.storeOAuthTokens(vendorId, body.provider, body.providerAccountId, body.accessToken, body.refreshToken);
  }

  @Post("/disconnect/:id")
  async disconnect(@Param("id") id: string) {
    return this.service.disconnectAccount(id);
  }

  @Get("/rules")
  async listRules(@Req() req: any) {
    const vendorId = req.user?.vendorId;
    return this.service.listRules(vendorId);
  }

  @Post("/rules")
  async createRule(@Req() req: any, @Body() dto: CreateRuleDto) {
    const vendorId = req.user?.vendorId;
    return this.service.createRule(vendorId, dto);
  }

  @Post("/rules/:id/trigger")
  async triggerRule(@Req() req: any, @Param("id") id: string) {
    const vendorId = req.user?.vendorId;
    return this.service.triggerRuleNow(vendorId, id);
  }
}
