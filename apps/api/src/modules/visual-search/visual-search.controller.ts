import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { VisualSearchService } from "./visual-search.service";

@ApiTags("visual-search")
@Controller({ path: "products", version: "1" })
export class VisualSearchController {
  constructor(private readonly visualSearchService: VisualSearchService) {}

  @Public()
  @Post("visual-search")
  @ApiOperation({ summary: "Search products by image or text hint" })
  search(@Body() body: { imageUrl?: string; query?: string }) {
    return this.visualSearchService.search(body.imageUrl, body.query);
  }
}
