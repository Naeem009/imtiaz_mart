import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Roles } from "@/common/decorators/roles.decorator";
import { VisualSearchService } from "@/modules/visual-search/visual-search.service";
import { CatalogSearchService } from "@/modules/search/catalog-search.service";
import { PaymentsService } from "@/modules/payments/payments.service";
import { ReturnsService } from "@/modules/returns/returns.service";
import { AdminService } from "./admin.service";
import { UpdateAdminCustomerDto } from "./dto/update-admin-customer.dto";
import { UpdateAdminProductDto } from "./dto/update-admin-product.dto";
import { UpdateEligibilityDto } from "./dto/update-eligibility.dto";
import { UpdatePlatformSettingsDto } from "./dto/update-platform-settings.dto";
import { UpdateVendorStatusDto } from "./dto/update-vendor-status.dto";

@ApiTags("admin")
@ApiBearerAuth()
@Roles("admin", "super_admin")
@Controller({ path: "admin", version: API_VERSION })
export class AdminController {
  constructor(
    private admin: AdminService,
    private visualSearch: VisualSearchService,
    private search: CatalogSearchService,
    private payments: PaymentsService,
    private returns: ReturnsService,
  ) {}

  @Get("reports")
  @ApiOperation({ summary: "Marketplace owner dashboard stats" })
  reports() {
    return this.admin.getStats();
  }

  @Get("vendors")
  @ApiOperation({ summary: "List vendors for admin review" })
  vendors() {
    return this.admin.listVendors();
  }

  @Patch("vendors/:id")
  @ApiOperation({ summary: "Approve or deactivate a vendor" })
  updateVendor(@Param("id") id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.admin.updateVendor(id, dto);
  }

  @Get("orders")
  @ApiOperation({ summary: "List all marketplace orders" })
  orders(@Query("page") page?: string) {
    return this.admin.listOrders(Math.max(1, parseInt(page ?? "1", 10) || 1));
  }

  @Get("products")
  @ApiOperation({ summary: "List marketplace products" })
  products(
    @Query("page") page?: string,
    @Query("q") q?: string,
    @Query("status") status?: string,
  ) {
    return this.admin.listProducts({
      page: Math.max(1, parseInt(page ?? "1", 10) || 1),
      q,
      status,
    });
  }

  @Patch("products/:id")
  @ApiOperation({ summary: "Update product status or agent eligibility" })
  updateProduct(@Param("id") id: string, @Body() dto: UpdateAdminProductDto) {
    return this.admin.updateProduct(id, dto);
  }

  @Get("customers")
  @ApiOperation({ summary: "List marketplace customers" })
  customers(@Query("page") page?: string, @Query("q") q?: string) {
    return this.admin.listCustomers({
      page: Math.max(1, parseInt(page ?? "1", 10) || 1),
      q,
    });
  }

  @Patch("customers/:id")
  @ApiOperation({ summary: "Activate or deactivate a customer account" })
  updateCustomer(@Param("id") id: string, @Body() dto: UpdateAdminCustomerDto) {
    return this.admin.updateCustomer(id, dto);
  }

  @Get("settings")
  @ApiOperation({ summary: "Get marketplace settings" })
  getSettings() {
    return this.admin.getSettings();
  }

  @Patch("settings")
  @ApiOperation({ summary: "Update marketplace settings" })
  updateSettings(@Body() dto: UpdatePlatformSettingsDto) {
    return this.admin.updateSettings(dto);
  }

  @Get("agent-commerce/eligibility")
  @ApiOperation({ summary: "List product AI agent eligibility flags" })
  eligibility() {
    return this.admin.listEligibility();
  }

  @Patch("agent-commerce/eligibility/:productId")
  @ApiOperation({ summary: "Update product AI agent eligibility" })
  updateEligibility(
    @Param("productId") productId: string,
    @Body() dto: UpdateEligibilityDto,
  ) {
    return this.admin.updateEligibility(productId, dto);
  }

  @Get("agent-commerce/feed-status")
  @ApiOperation({ summary: "Get AI commerce feed status" })
  feedStatus() {
    return this.admin.getFeedStatus();
  }

  @Post("search/reindex")
  @ApiOperation({ summary: "Reindex catalog into Elasticsearch" })
  reindexSearch() {
    return this.search.reindexAll();
  }

  @Get("payments")
  @ApiOperation({ summary: "List marketplace payments" })
  listPayments() {
    return this.payments.listAdmin();
  }

  @Get("returns")
  @ApiOperation({ summary: "List return requests" })
  listReturns() {
    return this.returns.listAll();
  }

  @Post("visual-search/reindex")
  @ApiOperation({ summary: "Reindex product image embeddings" })
  reindex() {
    return this.visualSearch.reindex();
  }

  @Get("store-social/accounts")
  @ApiOperation({ summary: "Marketplace social automation overview" })
  storeSocial() {
    return this.admin.listSocialOverview();
  }
}
