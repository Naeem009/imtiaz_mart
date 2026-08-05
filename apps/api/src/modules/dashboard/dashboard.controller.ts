import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

@Controller("/dashboard")
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get("/admin-stats")
  async adminStats() {
    return this.svc.getAdminStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get("/vendor-stats")
  async vendorStats(@Req() req: any) {
    const vendorId = req.user?.vendorId;
    return this.svc.getVendorStats(vendorId);
  }
}
