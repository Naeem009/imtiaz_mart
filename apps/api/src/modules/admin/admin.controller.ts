import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { API_VERSION } from "@imtiaz-mart/shared";
import { Roles } from "@/common/decorators/roles.decorator";
import { VisualSearchService } from "@/modules/visual-search/visual-search.service";
import { CatalogSearchService } from "@/modules/search/catalog-search.service";
import { PaymentsService } from "@/modules/payments/payments.service";
import { ReturnsService } from "@/modules/returns/returns.service";
import { AdminService } from "./admin.service";
import { CreateAdminCategoryDto } from "./dto/create-admin-category.dto";
import { UpdateAdminCategoryDto } from "./dto/update-admin-category.dto";
import { CreateAdminProductDto } from "./dto/create-admin-product.dto";
import { UpdateAdminCustomerDto } from "./dto/update-admin-customer.dto";
import { UpdateAdminProductDto } from "./dto/update-admin-product.dto";
import { UpdateAdminProductFullDto } from "./dto/update-admin-product-full.dto";
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

  @Get("categories")
  @ApiOperation({ summary: "List catalog categories for administration" })
  categories() {
    return this.admin.listCategories();
  }

  @Post("categories")
  @ApiOperation({ summary: "Create a catalog category" })
  createCategory(@Body() dto: CreateAdminCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Patch("categories/:id")
  @ApiOperation({ summary: "Update a catalog category" })
  updateCategory(@Param("id") id: string, @Body() dto: UpdateAdminCategoryDto) {
    return this.admin.updateCategory(id, dto);
  }

  @Delete("categories/:id")
  @ApiOperation({ summary: "Archive a catalog category" })
  deleteCategory(@Param("id") id: string) {
    return this.admin.archiveCategory(id);
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

  @Post("products")
  @ApiOperation({ summary: "Create a marketplace product" })
  createProduct(@Body() dto: CreateAdminProductDto) {
    return this.admin.createProduct(dto);
  }

  @Patch("products/:id/details")
  @ApiOperation({ summary: "Update marketplace product details" })
  updateProductDetails(@Param("id") id: string, @Body() dto: UpdateAdminProductFullDto) {
    return this.admin.updateProductDetails(id, dto);
  }

  @Delete("products/:id")
  @ApiOperation({ summary: "Archive a marketplace product" })
  deleteProduct(@Param("id") id: string) {
    return this.admin.archiveProduct(id);
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
