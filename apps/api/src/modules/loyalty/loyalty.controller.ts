import { Controller, Get } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { LoyaltyService } from "./loyalty.service";

@ApiTags("loyalty")
@ApiBearerAuth()
@Controller({ path: "customer/rewards", version: API_VERSION })
export class LoyaltyController {
  constructor(private loyalty: LoyaltyService) {}

  @Get()
  @ApiOperation({ summary: "Get reward points balance" })
  get(@CurrentUser() user: JwtPayload) {
    return this.loyalty.getAccount(user.sub);
  }
}
