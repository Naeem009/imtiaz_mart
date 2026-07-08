import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class VendorOrdersService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string, page = 1) {
    const vendor = await this.prisma.client.vendor.findFirst({
      where: { ownerId: userId, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException("Vendor not found");
    }

    const take = 20;
    const skip = (page - 1) * take;

    const [items, total] = await Promise.all([
      this.prisma.client.orderItem.findMany({
        where: { vendorId: vendor.id },
        include: {
          order: true,
        },
        orderBy: [{ order: { createdAt: "desc" } }],
        skip,
        take,
      }),
      this.prisma.client.orderItem.count({ where: { vendorId: vendor.id } }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }
}
