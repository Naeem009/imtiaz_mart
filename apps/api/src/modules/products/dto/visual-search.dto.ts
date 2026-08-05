import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

export class VisualSearchDto {
  @ApiPropertyOptional({ description: "Public image URL for visual search." })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: "Optional text hint to refine visual search results.", maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  query?: string;
}
