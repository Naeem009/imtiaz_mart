import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Public } from "@/common/decorators/public.decorator";
import { ProductsQueryDto } from "@/modules/products/dto/products-query.dto";
import { CategoriesService } from "./categories.service";

@ApiTags("categories")
@Controller({ path: "categories", version: API_VERSION })
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "List all categories" })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @Get(":slug/products")
  @ApiOperation({ summary: "List products in category" })
  getProducts(@Param("slug") slug: string, @Query() query: ProductsQueryDto) {
    return this.categoriesService.getCategoryProducts(slug, query);
  }

  @Public()
  @Get(":slug")
  @ApiOperation({ summary: "Get category by slug" })
  findOne(@Param("slug") slug: string) {
    return this.categoriesService.findBySlug(slug);
  }
}
