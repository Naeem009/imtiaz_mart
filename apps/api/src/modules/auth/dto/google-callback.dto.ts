import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class GoogleCallbackDto {
  @ApiProperty({ description: "Authorization code from Google" })
  @IsString()
  @MinLength(1)
  code!: string;

  @ApiProperty({
    example: "http://localhost:3000/auth/google/callback",
  })
  @IsString()
  @MinLength(8)
  redirectUri!: string;
}
