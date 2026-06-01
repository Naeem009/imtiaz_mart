import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

export class ProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: "Category slug" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: "Brand slug" })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: "Vendor slug" })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({
    enum: ["newest", "price_asc", "price_desc", "rating", "bestseller"],
    default: "newest",
  })
  @IsOptional()
  @IsIn(["newest", "price_asc", "price_desc", "rating", "bestseller", "trending"])
  sort?: string;
}
