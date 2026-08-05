import { Controller, Get } from "@nestjs/common";
import { FeedsService } from "./feeds.service";

@Controller({ path: "feeds", version: "1" })
export class FeedsController {
  constructor(private feeds: FeedsService) {}

  @Get("/ucp")
  async ucp() {
    const feed = await this.feeds.getUcpFeed();
    return { data: feed, generatedAt: new Date().toISOString() };
  }
}
