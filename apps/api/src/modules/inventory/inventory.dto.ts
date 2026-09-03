import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InventoryTransactionType } from "@imtiaz-mart/database";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from "class-validator";

export class CreateWarehouseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ default: "PK" })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;
}

export class AdjustInventoryDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @ApiProperty()
  @IsInt()
  delta!: number;

  @ApiProperty({ enum: InventoryTransactionType })
  @IsEnum(InventoryTransactionType)
  type!: InventoryTransactionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ default: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
