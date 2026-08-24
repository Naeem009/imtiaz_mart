import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class GeneratePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  productId?: string;
}
