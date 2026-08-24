import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateAdminCustomerDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}
