import { IsArray, IsString } from "class-validator";

export class ConnectAccountDto {
  @IsString()
  provider!: string;

  @IsString()
  providerAccountId!: string;

  @IsArray()
  @IsString({ each: true })
  scopes!: string[];
}

