import { IsString, IsArray } from "class-validator";

export class ConnectAccountDto {
  @IsString()
  provider!: string;

  @IsString()
  providerAccountId!: string;

  @IsArray()
  scopes!: string[];
}
