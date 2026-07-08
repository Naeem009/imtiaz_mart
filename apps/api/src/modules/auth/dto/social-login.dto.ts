import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, MinLength } from "class-validator";

export class SocialLoginDto {
  @ApiProperty({ example: "google" })
  @IsString()
  @IsIn(["google"])
  provider!: "google";

  @ApiProperty({ example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..." })
  @IsString()
  @MinLength(1)
  idToken!: string;
}
