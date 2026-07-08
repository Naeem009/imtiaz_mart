import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { CreateVendorProductDto } from "./dto/create-vendor-product.dto";
import { RegisterVendorDto } from "./dto/register-vendor.dto";
import { UpdateVendorProductDto } from "./dto/update-vendor-product.dto";
import { UpdateVendorProfileDto } from "./dto/update-vendor-profile.dto";
import { VendorProductsService } from "./vendor-products.service";
import { VendorOrdersService } from "./vendor-orders.service";
import { VendorsService } from "./vendors.service";

@ApiTags("vendor")
@Controller({ path: "vendor", version: API_VERSION })
export class VendorsController {
  constructor(
    private vendors: VendorsService,
    private products: VendorProductsService,
    private orders: VendorOrdersService,
  ) {}

  @Post("register")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Register a new vendor store" })
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterVendorDto) {
    return this.vendors.registerStore(user.sub, dto);
  }

  @Get("profile")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get vendor store profile" })
  profile(@CurrentUser() user: JwtPayload) {
    return this.vendors.getProfile(user.sub);
  }

  @Patch("profile")
  @Roles("vendor")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update vendor store profile" })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateVendorProfileDto,
  ) {
    return this.vendors.updateProfile(user.sub, dto);
  }

  @Get("products")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List vendor products" })
  listProducts(@CurrentUser() user: JwtPayload) {
    return this.products.list(user.sub);
  }

  @Post("products")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a product" })
  createProduct(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateVendorProductDto,
  ) {
    return this.products.create(user.sub, dto);
  }

  @Patch("products/:id")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a product" })
  updateProduct(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: UpdateVendorProductDto,
  ) {
    return this.products.update(user.sub, id, dto);
  }

  @Delete("products/:id")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Archive a product" })
  deleteProduct(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.products.archive(user.sub, id);
  }

  @Get("orders")
  @Roles("vendor", "vendor_staff")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List orders containing vendor items" })
  listOrders(
    @CurrentUser() user: JwtPayload,
    @Query("page") page?: string,
  ) {
    return this.orders.list(
      user.sub,
      Math.max(1, parseInt(page ?? "1", 10) || 1),
    );
  }
}

@ApiTags("vendors")
@Controller({ path: "vendors", version: API_VERSION })
export class PublicVendorsController {
  constructor(private vendors: VendorsService) {}

  @Public()
  @Get(":slug")
  @ApiOperation({ summary: "Get public vendor store" })
  getStore(@Param("slug") slug: string) {
    return this.vendors.getPublicStore(slug);
  }
}
