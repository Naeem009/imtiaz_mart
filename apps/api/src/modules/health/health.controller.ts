import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";
import { RedisService } from "@/modules/redis/redis.module";
import { ElasticsearchService } from "@/modules/search/elasticsearch.service";

@ApiTags("health")
@Controller({ path: "health", version: API_VERSION })
export class HealthController {
  constructor(
    private redis: RedisService,
    private elasticsearch: ElasticsearchService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check" })
  check() {
    return {
      status: "ok",
      service: "imtiaz-mart-api",
      version: API_VERSION,
      timestamp: new Date().toISOString(),
      redis: this.redis.enabled ? "configured" : "disabled",
      elasticsearch: this.elasticsearch.enabled ? "configured" : "disabled",
    };
  }
}
