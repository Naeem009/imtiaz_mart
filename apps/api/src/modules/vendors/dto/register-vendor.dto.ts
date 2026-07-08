import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterVendorDto {
  @ApiProperty({ example: "TechHub PK" })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  storeName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
