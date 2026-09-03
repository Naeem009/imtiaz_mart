import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { JwtPayload } from "@/modules/auth/interfaces/jwt-payload.interface";
import { AdjustInventoryDto, CreateWarehouseDto } from "./inventory.dto";
import { InventoryService } from "./inventory.service";

@ApiTags("vendor-inventory")
@ApiBearerAuth()
@Roles("vendor", "vendor_staff")
@Controller({ path: "vendor/inventory", version: API_VERSION })
export class InventoryController {
  constructor(private inventory: InventoryService) {}

  @Get()
  @ApiOperation({ summary: "List vendor warehouses and inventory" })
  list(@CurrentUser() user: JwtPayload) {
    return this.inventory.list(user.sub);
  }

  @Post("warehouses")
  @ApiOperation({ summary: "Create a vendor warehouse" })
  createWarehouse(@CurrentUser() user: JwtPayload, @Body() dto: CreateWarehouseDto) {
    return this.inventory.createWarehouse(user.sub, dto);
  }

  @Patch("warehouses/:warehouseId")
  @ApiOperation({ summary: "Adjust inventory for a product variant" })
  adjust(@CurrentUser() user: JwtPayload, @Param("warehouseId") warehouseId: string, @Body() dto: AdjustInventoryDto) {
    return this.inventory.adjust(user.sub, warehouseId, dto);
  }
}
