import { Controller, Get, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { AffiliatesService } from "./affiliates.service";

@ApiTags("affiliate")
@ApiBearerAuth()
@Controller({ path: "affiliate", version: API_VERSION })
export class AffiliatesController {
  constructor(private affiliates: AffiliatesService) {}

  @Get("me")
  @ApiOperation({ summary: "Get affiliate dashboard" })
  me(@CurrentUser() user: JwtPayload) {
    return this.affiliates.me(user.sub);
  }

  @Post("register")
  @ApiOperation({ summary: "Join the affiliate program" })
  register(@CurrentUser() user: JwtPayload) {
    return this.affiliates.register(user.sub);
  }
}
