import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsString, IsUUID, Min, IsOptional } from "class-validator";

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  variantId!: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity = 1;
}
