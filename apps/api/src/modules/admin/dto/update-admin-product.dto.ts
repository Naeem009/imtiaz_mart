import { ApiPropertyOptional } from "@nestjs/swagger";
import { ProductStatus } from "@imtiaz-mart/database";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class UpdateAdminProductDto {
  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEligibleSearch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEligibleCheckout?: boolean;
}
