import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";
import { ProductsQueryDto } from "./dto/products-query.dto";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller({ path: "products", version: API_VERSION })
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List products with pagination and filters" })
  findAll(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get("search")
  @ApiOperation({ summary: "Search products" })
  search(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get("filter")
  @ApiOperation({ summary: "Filter products" })
  filter(@Query() query: ProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get("recommendations")
  @ApiOperation({ summary: "Get recommended products" })
  recommendations(@Query("limit") limit?: string) {
    const parsed = limit ? Math.min(parseInt(limit, 10), 24) : 8;
    return this.productsService.getRecommendations(parsed);
  }

  @Public()
  @Get(":slug")
  @ApiOperation({ summary: "Get product by slug" })
  findOne(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }
}
