import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateEligibilityDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEligibleSearch?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEligibleCheckout?: boolean;
}
