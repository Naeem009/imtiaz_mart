import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ProductStatus } from "@imtiaz-mart/database";
import { Type } from "class-transformer";
import { VendorProductVariantDto } from "./create-vendor-product.dto";

export class UpdateVendorProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: "Include this product in AI commerce discovery feeds" })
  @IsOptional()
  @IsBoolean()
  isEligibleSearch?: boolean;

  @ApiPropertyOptional({ description: "Allow this product to be eligible for agentic checkout" })
  @IsOptional()
  @IsBoolean()
  isEligibleCheckout?: boolean;

  @ApiPropertyOptional({ type: [VendorProductVariantDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => VendorProductVariantDto)
  variants?: VendorProductVariantDto[];
}
