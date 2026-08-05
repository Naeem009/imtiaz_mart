import { Controller, Get, Header, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { AgentCommerceService } from "./agent-commerce.service";

@ApiTags("agent-commerce")
@Controller()
export class AgentCommerceController {
  constructor(private service: AgentCommerceService) {}

  @Public()
  @Get(".well-known/commerce-manifest.json")
  @ApiOperation({ summary: "Get AI commerce manifest" })
  getManifest(@Query("appUrl") appUrl?: string) {
    return this.service.getManifest(appUrl ?? process.env.APP_URL ?? "http://localhost:3000");
  }

  @Public()
  @Get("llms.txt")
  @Header("Content-Type", "text/plain; charset=utf-8")
  @ApiOperation({ summary: "Get AI crawler guidance text" })
  getLlmInstructions() {
    return this.service.getLlmInstructions();
  }

  @Public()
  @Get("feeds/ucp")
  @ApiOperation({ summary: "Get UCP product feed" })
  getUcpFeed() {
    return this.service.getUcpFeed();
  }

  @Public()
  @Get("feeds/acp")
  @ApiOperation({ summary: "Get ACP product feed" })
  getAcpFeed() {
    return this.service.getAcpFeed();
  }

  @Public()
  @Get("feeds/perplexity")
  @ApiOperation({ summary: "Get Perplexity product feed" })
  getPerplexityFeed() {
    return this.service.getPerplexityFeed();
  }
}
