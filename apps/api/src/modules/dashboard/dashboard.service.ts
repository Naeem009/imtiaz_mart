import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [users, vendors, products, orders] = await Promise.all([
      this.prisma.client.user.count(),
      this.prisma.client.vendor.count(),
      this.prisma.client.product.count(),
      this.prisma.client.order.count(),
    ]);
    return { users, vendors, products, orders };
  }

  async getVendorStats(vendorId: string) {
    const [products, orders, revenue] = await Promise.all([
      this.prisma.client.product.count({ where: { vendorId } }),
      this.prisma.client.orderItem.count({ where: { vendorId } }),
      this.prisma.client.orderItem.aggregate({ where: { vendorId }, _sum: { total: true } }).then((r) => Number(r._sum.total ?? 0)),
    ]);
    return { products, orders, revenue };
  }
}
