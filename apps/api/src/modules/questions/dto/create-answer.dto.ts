import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateAnswerDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(2000)
  body!: string;
}
