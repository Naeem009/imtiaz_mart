import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";

@ApiTags("health")
@Controller({ path: "health", version: API_VERSION })
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: "Health check" })
  check() {
    return {
      status: "ok",
      service: "imtiaz-mart-api",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
    };
  }
}
