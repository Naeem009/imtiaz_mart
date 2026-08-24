import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReturnStatus } from "@imtiaz-mart/database";
import { API_VERSION } from "@imtiaz-mart/shared";
import { IsArray, IsIn, IsOptional, IsString } from "class-validator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { ReturnsService } from "./returns.service";

class CreateReturnDto {
  @IsString()
  orderNumber!: string;

  @IsArray()
  @IsString({ each: true })
  itemIds!: string[];

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

class UpdateReturnDto {
  @IsIn(["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"])
  status!: ReturnStatus;
}

@ApiTags("returns")
@ApiBearerAuth()
@Controller({ version: API_VERSION })
export class ReturnsController {
  constructor(private returns: ReturnsService) {}

  @Get("orders/return")
  @ApiOperation({ summary: "List my return requests" })
  mine(@CurrentUser() user: JwtPayload) {
    return this.returns.listMine(user.sub);
  }

  @Post("orders/return")
  @ApiOperation({ summary: "Request a return" })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateReturnDto) {
    return this.returns.create(user.sub, dto);
  }

  @Roles("admin", "super_admin")
  @Patch("admin/returns/:id")
  @ApiOperation({ summary: "Update a return request status" })
  update(@Param("id") id: string, @Body() dto: UpdateReturnDto) {
    return this.returns.updateStatus(id, dto.status);
  }
}
