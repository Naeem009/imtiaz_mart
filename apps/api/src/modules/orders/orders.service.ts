import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InventoryTransactionType, OrderStatus, PaymentStatus } from "@imtiaz-mart/database";
import type { OrderDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CartService } from "@/modules/cart/cart.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { LoyaltyService } from "@/modules/loyalty/loyalty.service";
import { AffiliatesService } from "@/modules/affiliates/affiliates.service";
import { PaymentsService, type PaymentMethod } from "@/modules/payments/payments.service";
import { CreateOrderDto } from "./dto/create-order.dto";

const FREE_SHIPPING_THRESHOLD = 2999;
const SHIPPING_FEE = 250;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private customers: CustomersService,
    private loyalty: LoyaltyService,
    private affiliates: AffiliatesService,
    private payments: PaymentsService,
  ) {}

  async create(
    userId: string,
    sessionId: string | undefined,
    dto: CreateOrderDto,
  ): Promise<OrderDto> {
    const customer = await this.customers.ensureCustomer(userId);
    const cartRecord = await this.cartService.resolveCartRecord({
      userId,
      sessionId,
    });

    if (!cartRecord.items.length) {
      throw new BadRequestException("Cart is empty");
    }

    for (const item of cartRecord.items) {
      if (item.variant.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.product.name}`,
        );
      }
    }

    const subtotal = cartRecord.items.reduce(
      (sum, item) => sum + Number(item.variant.price) * item.quantity,
      0,
    );
    const shippingAmount =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const taxAmount = 0;

    const rewards = await this.loyalty.ensureAccount(userId);
    const requestedPoints = Math.max(0, dto.pointsToRedeem ?? 0);
    const usedPoints = this.loyalty.maxRedeemable(subtotal, Math.min(requestedPoints, rewards.balance));
    const discount = this.loyalty.redeemableValue(usedPoints);
    const total = Math.max(0, subtotal + shippingAmount + taxAmount - discount);
    const orderNumber = `IMT-${Date.now().toString(36).toUpperCase()}`;
    const method = dto.paymentMethod as PaymentMethod;

    const order = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          id: uuidv7(),
          orderNumber,
          customerId: customer.id,
          status: OrderStatus.PENDING,
          subtotal,
          shippingAmount,
          taxAmount,
          total,
          affiliateCode: dto.affiliateCode,
          pointsRedeemed: usedPoints,
          shippingName: dto.shippingName,
          shippingPhone: dto.shippingPhone,
          shippingLine1: dto.shippingLine1,
          shippingLine2: dto.shippingLine2,
          shippingCity: dto.shippingCity,
          shippingState: dto.shippingState,
          shippingPostal: dto.shippingPostal,
          shippingCountry: dto.shippingCountry,
          items: {
            create: cartRecord.items.map((item) => ({
              id: uuidv7(),
              productId: item.productId,
              variantId: item.variantId,
              vendorId: item.product.vendorId,
              productName: item.product.name,
              variantName: item.variant.name,
              unitPrice: item.variant.price,
              quantity: item.quantity,
              total: Number(item.variant.price) * item.quantity,
            })),
          },
          statusHistory: {
            create: {
              id: uuidv7(),
              status: OrderStatus.PENDING,
              note: "Order placed",
            },
          },
          payments: {
            create: {
              id: uuidv7(),
              amount: total,
              method,
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: { items: true, payments: true },
      });

      if (usedPoints > 0) {
        await tx.rewardAccount.update({
          where: { id: rewards.id },
          data: { balance: { decrement: usedPoints } },
        });
        await tx.rewardTransaction.create({
          data: {
            id: uuidv7(),
            accountId: rewards.id,
            points: -usedPoints,
            type: "REDEEM",
            note: "Checkout redemption",
            orderId: created.id,
          },
        });
      }

      for (const item of cartRecord.items) {
        const warehouseInventory = await tx.inventory.findFirst({
          where: {
            variantId: item.variantId,
            warehouse: { vendorId: item.product.vendorId, isActive: true },
            quantity: { gte: item.quantity },
          },
          orderBy: { quantity: "desc" },
        });
        if (warehouseInventory) {
          const updatedInventory = await tx.inventory.update({
            where: { id: warehouseInventory.id },
            data: { quantity: { decrement: item.quantity } },
          });
          await tx.inventoryTransaction.create({
            data: {
              id: uuidv7(),
              inventoryId: updatedInventory.id,
              type: InventoryTransactionType.SALE,
              delta: -item.quantity,
              quantity: updatedInventory.quantity,
              reason: `Order ${orderNumber}`,
            },
          });
        }
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cartRecord.id } });

      return tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: true, payments: true },
      });
    });

    const payment = order.payments[0];
    if (payment) {
      await this.payments.capture({
        paymentId: payment.id,
        method,
        amount: total,
        cardToken: dto.cardToken,
      });
    }

    const paid = method !== "cod";
    if (paid) {
      await this.payments.createEscrow(
        order.id,
        order.items.map((item) => ({ vendorId: item.vendorId, total: Number(item.total) })),
      );
      const earned = await this.loyalty.earn(userId, order.id, total);
      await this.affiliates.attributeOrder(dto.affiliateCode, order.id, subtotal);
      await this.prisma.client.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED, pointsEarned: earned },
      });
      await this.prisma.client.orderStatusHistory.create({
        data: {
          id: uuidv7(),
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          note: `Paid with ${method}`,
        },
      });
    } else {
      await this.prisma.client.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CONFIRMED },
      });
      await this.prisma.client.orderStatusHistory.create({
        data: {
          id: uuidv7(),
          orderId: order.id,
          status: OrderStatus.CONFIRMED,
          note: "Cash on delivery — order confirmed",
        },
      });
    }

    const fresh = await this.prisma.client.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true, payments: true },
    });
    return this.mapOrder(fresh);
  }

  async findByOrderNumber(userId: string, orderNumber: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const order = await this.prisma.client.order.findFirst({
      where: { orderNumber, customerId: customer.id },
      include: { items: true, payments: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    return this.mapOrder(order);
  }

  async listForCustomer(userId: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const orders = await this.prisma.client.order.findMany({
      where: { customerId: customer.id },
      include: { items: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
    return orders.map((o) => this.mapOrder(o));
  }

  private mapOrder(order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotal: { toNumber?: () => number } | number;
    shippingAmount: { toNumber?: () => number } | number;
    taxAmount: { toNumber?: () => number } | number;
    total: { toNumber?: () => number } | number;
    currency: string;
    shippingName: string;
    shippingLine1: string;
    shippingLine2: string | null;
    shippingCity: string;
    shippingPostal: string;
    shippingCountry: string;
    createdAt: Date;
    pointsEarned?: number;
    pointsRedeemed?: number;
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      unitPrice: { toNumber?: () => number } | number;
      quantity: number;
      total: { toNumber?: () => number } | number;
    }>;
    payments?: Array<{ method: string; status: string }>;
  }): OrderDto {
    const num = (v: { toNumber?: () => number } | number) =>
      typeof v === "number" ? v : Number(v.toNumber?.() ?? v);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: num(order.subtotal),
      shippingAmount: num(order.shippingAmount),
      taxAmount: num(order.taxAmount),
      total: num(order.total),
      currency: order.currency,
      shippingName: order.shippingName,
      shippingLine1: order.shippingLine1,
      shippingLine2: order.shippingLine2,
      shippingCity: order.shippingCity,
      shippingPostal: order.shippingPostal,
      shippingCountry: order.shippingCountry,
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.payments?.[0]?.method,
      paymentStatus: order.payments?.[0]?.status,
      pointsEarned: order.pointsEarned,
      pointsRedeemed: order.pointsRedeemed,
      items: order.items.map((i) => ({
        id: i.id,
        productName: i.productName,
        variantName: i.variantName,
        unitPrice: num(i.unitPrice),
        quantity: i.quantity,
        total: num(i.total),
      })),
    };
  }
}
