import { IsString, IsOptional } from "class-validator";

export class OAuthCallbackDto {
  @IsString()
  provider!: string;

  @IsString()
  providerAccountId!: string;

  @IsOptional()
  @IsString()
  accessToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  expiresIn?: number;
}
