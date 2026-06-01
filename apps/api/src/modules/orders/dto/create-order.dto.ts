import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

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

  @ApiProperty({ enum: ["cod", "card"], default: "cod" })
  @IsIn(["cod", "card"])
  paymentMethod: "cod" | "card" = "cod";
}
