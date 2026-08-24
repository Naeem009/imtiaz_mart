import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ReturnStatus } from "@imtiaz-mart/database";
import type { ReturnRequestDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  async listMine(userId: string): Promise<ReturnRequestDto[]> {
    const customer = await this.customers.ensureCustomer(userId);
    const rows = await this.prisma.client.returnRequest.findMany({
      where: { customerId: customer.id },
      include: { order: true, items: { include: { orderItem: true } } },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.map(row));
  }

  async create(
    userId: string,
    data: { orderNumber: string; itemIds: string[]; reason: string; note?: string },
  ): Promise<ReturnRequestDto> {
    const customer = await this.customers.ensureCustomer(userId);
    const order = await this.prisma.client.order.findFirst({
      where: { orderNumber: data.orderNumber, customerId: customer.id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    if (!["DELIVERED", "SHIPPED"].includes(order.status)) {
      throw new BadRequestException("Returns are available after the order ships");
    }

    const items = order.items.filter((item) => data.itemIds.includes(item.id));
    if (!items.length) throw new BadRequestException("Select at least one item to return");

    const created = await this.prisma.client.returnRequest.create({
      data: {
        id: uuidv7(),
        orderId: order.id,
        customerId: customer.id,
        reason: data.reason,
        note: data.note,
        items: {
          create: items.map((item) => ({
            id: uuidv7(),
            orderItemId: item.id,
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { order: true, items: { include: { orderItem: true } } },
    });
    return this.map(created);
  }

  async listAll(): Promise<ReturnRequestDto[]> {
    const rows = await this.prisma.client.returnRequest.findMany({
      include: { order: true, items: { include: { orderItem: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((row) => this.map(row));
  }

  async updateStatus(id: string, status: ReturnStatus) {
    const existing = await this.prisma.client.returnRequest.findUnique({
      where: { id },
      include: { items: true, order: { include: { payments: true } } },
    });
    if (!existing) throw new NotFoundException("Return not found");

    if (status === ReturnStatus.REFUNDED) {
      const refundItems = await this.prisma.client.orderItem.findMany({
        where: { id: { in: existing.items.map((item) => item.orderItemId) } },
      });
      const amount = refundItems.reduce((sum, item) => sum + Number(item.total), 0);
      const payment = existing.order.payments[0];
      if (payment && amount > 0) {
        await this.prisma.client.payment.create({
          data: {
            id: uuidv7(),
            orderId: existing.orderId,
            amount,
            method: payment.method,
            status: "REFUNDED",
            gateway: payment.gateway,
            transactionId: `refund_${Date.now().toString(36)}`,
          },
        });
      }
      await this.prisma.client.order.update({
        where: { id: existing.orderId },
        data: { status: "RETURNED" },
      });
    }

    const updated = await this.prisma.client.returnRequest.update({
      where: { id },
      data: { status },
      include: { order: true, items: { include: { orderItem: true } } },
    });
    return this.map(updated);
  }

  private map(row: {
    id: string;
    status: string;
    reason: string;
    note: string | null;
    createdAt: Date;
    order: { orderNumber: string };
    items: Array<{ id: string; quantity: number; orderItem: { productName: string } }>;
  }): ReturnRequestDto {
    return {
      id: row.id,
      orderNumber: row.order.orderNumber,
      status: row.status,
      reason: row.reason,
      note: row.note,
      createdAt: row.createdAt.toISOString(),
      items: row.items.map((item) => ({
        id: item.id,
        productName: item.orderItem.productName,
        quantity: item.quantity,
      })),
    };
  }
}
