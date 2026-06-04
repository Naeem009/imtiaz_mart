import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { CustomersService } from "./customers.service";

@ApiTags("customer")
@ApiBearerAuth()
@Controller({ path: "customer", version: API_VERSION })
export class CustomersController {
  constructor(private customers: CustomersService) {}

  @Get("addresses")
  @ApiOperation({ summary: "List saved addresses" })
  listAddresses(@CurrentUser() user: JwtPayload) {
    return this.customers.listAddresses(user.sub);
  }

  @Post("addresses")
  @ApiOperation({ summary: "Add a new address" })
  createAddress(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customers.createAddress(user.sub, dto);
  }

  @Patch("addresses/:id")
  @ApiOperation({ summary: "Update an address" })
  updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customers.updateAddress(user.sub, id, dto);
  }

  @Delete("addresses/:id")
  @ApiOperation({ summary: "Delete an address" })
  deleteAddress(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.customers.deleteAddress(user.sub, id);
  }
}
