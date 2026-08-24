import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { IsOptional, IsString } from "class-validator";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CustomersService } from "@/modules/customers/customers.service";
import { VendorsService } from "@/modules/vendors/vendors.service";
import { PaymentsService } from "./payments.service";

class SavePaymentMethodDto {
  @IsString()
  token!: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsString()
  lastFour!: string;
}

@ApiTags("payments")
@ApiBearerAuth()
@Controller({ version: API_VERSION })
export class PaymentsController {
  constructor(
    private payments: PaymentsService,
    private customers: CustomersService,
    private vendors: VendorsService,
  ) {}

  @Get("customer/payment-methods")
  @ApiOperation({ summary: "List saved payment methods" })
  async methods(@CurrentUser() user: JwtPayload) {
    const customer = await this.customers.ensureCustomer(user.sub);
    return this.payments.listMethods(customer.id);
  }

  @Post("customer/payment-methods")
  @ApiOperation({ summary: "Save a tokenized payment method" })
  async save(@CurrentUser() user: JwtPayload, @Body() dto: SavePaymentMethodDto) {
    const customer = await this.customers.ensureCustomer(user.sub);
    return this.payments.saveMethod(customer.id, {
      provider: "card",
      token: dto.token,
      brand: dto.brand,
      lastFour: dto.lastFour,
    });
  }

  @Roles("vendor", "vendor_staff")
  @Get("vendor/payouts")
  @ApiOperation({ summary: "List vendor payouts" })
  async payouts(@CurrentUser() user: JwtPayload) {
    const vendor = await this.vendors.resolveVendorForUser(user.sub);
    return this.payments.listPayouts(vendor.id);
  }

  @Roles("admin", "super_admin")
  @Patch("admin/payments/:id/paid")
  @ApiOperation({ summary: "Mark a COD payment as collected" })
  markPaid(@Param("id") id: string) {
    return this.payments.markPaid(id);
  }
}
