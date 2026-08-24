import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from "class-validator";

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  shippingName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingPhone?: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  shippingLine1!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingLine2?: string;

  @ApiProperty()
  @IsString()
  shippingCity!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shippingState?: string;

  @ApiProperty()
  @IsString()
  shippingPostal!: string;

  @ApiPropertyOptional({ default: "PK" })
  @IsOptional()
  @IsString()
  shippingCountry = "PK";

  @ApiProperty({ enum: ["cod", "card", "jazzcash", "easypaisa", "bank_transfer"], default: "cod" })
  @IsIn(["cod", "card", "jazzcash", "easypaisa", "bank_transfer"])
  paymentMethod: "cod" | "card" | "jazzcash" | "easypaisa" | "bank_transfer" = "cod";

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cardToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pointsToRedeem?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  affiliateCode?: string;
}
