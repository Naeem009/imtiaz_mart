import { IsString, IsArray, IsOptional } from "class-validator";

export class CreateRuleDto {
  @IsString()
  name!: string;

  @IsArray()
  triggers!: string[];

  @IsArray()
  platforms!: string[];

  @IsOptional()
  config?: any;
}
