import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";
import { BrandsService } from "./brands.service";

@ApiTags("brands")
@Controller({ path: "brands", version: API_VERSION })
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List all brands" })
  findAll() {
    return this.brandsService.findAll();
  }
}
