import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from "class-validator";

export class RegisterDto {
  @ApiProperty({ example: "customer@example.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, example: "SecurePass1!" })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ example: "Ali" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: "Khan" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
