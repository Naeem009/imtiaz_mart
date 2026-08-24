import { Injectable, NotFoundException } from "@nestjs/common";
import type { VendorOrderDto } from "@imtiaz-mart/shared";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { VendorsService } from "./vendors.service";

@Injectable()
export class VendorOrdersService {
  constructor(
    private prisma: PrismaService,
    private vendors: VendorsService,
  ) {}

  async list(userId: string, page = 1) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const take = 20;
    const skip = (page - 1) * take;

    const grouped = await this.prisma.client.order.findMany({
      where: { items: { some: { vendorId: vendor.id } } },
      include: {
        items: { where: { vendorId: vendor.id } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const total = await this.prisma.client.order.count({
      where: { items: { some: { vendorId: vendor.id } } },
    });

    const data: VendorOrderDto[] = grouped.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      customerName: order.shippingName,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      vendorTotal: order.items.reduce((sum, item) => sum + Number(item.total), 0),
    }));

    return {
      data,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  }

  async getByOrderNumber(userId: string, orderNumber: string): Promise<VendorOrderDto> {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const order = await this.prisma.client.order.findFirst({
      where: {
        orderNumber,
        items: { some: { vendorId: vendor.id } },
      },
      include: { items: { where: { vendorId: vendor.id } } },
    });
    if (!order) throw new NotFoundException("Order not found");

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      customerName: order.shippingName,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      vendorTotal: order.items.reduce((sum, item) => sum + Number(item.total), 0),
    };
  }
}
