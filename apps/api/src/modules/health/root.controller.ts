import { Controller, Get } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";

@ApiExcludeController()
@Controller()
export class RootController {
  @Public()
  @Get()
  info() {
    return {
      status: "ok",
      service: "imtiaz-mart-api",
      health: "/api/v1/health",
      docs: "/api/docs",
    };
  }
}
