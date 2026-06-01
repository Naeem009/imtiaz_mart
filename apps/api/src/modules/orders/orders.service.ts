import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { OrderStatus, PaymentStatus } from "@imtiaz-mart/database";
import type { OrderDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CartService } from "@/modules/cart/cart.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { CreateOrderDto } from "./dto/create-order.dto";

const FREE_SHIPPING_THRESHOLD = 2999;
const SHIPPING_FEE = 250;

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private customers: CustomersService,
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
    const total = subtotal + shippingAmount + taxAmount;
    const orderNumber = `IMT-${Date.now().toString(36).toUpperCase()}`;

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
              method: dto.paymentMethod,
              status:
                dto.paymentMethod === "cod"
                  ? PaymentStatus.PENDING
                  : PaymentStatus.PENDING,
            },
          },
        },
        include: { items: true, payments: true },
      });

      for (const item of cartRecord.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cartRecord.id } });

      if (dto.paymentMethod === "cod") {
        await tx.order.update({
          where: { id: created.id },
          data: { status: OrderStatus.CONFIRMED },
        });
        await tx.orderStatusHistory.create({
          data: {
            id: uuidv7(),
            orderId: created.id,
            status: OrderStatus.CONFIRMED,
            note: "Cash on delivery — order confirmed",
          },
        });
      }

      return tx.order.findUniqueOrThrow({
        where: { id: created.id },
        include: { items: true },
      });
    });

    return this.mapOrder(order);
  }

  async findByOrderNumber(userId: string, orderNumber: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const order = await this.prisma.client.order.findFirst({
      where: { orderNumber, customerId: customer.id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException("Order not found");
    return this.mapOrder(order);
  }

  async listForCustomer(userId: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const orders = await this.prisma.client.order.findMany({
      where: { customerId: customer.id },
      include: { items: true },
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
    items: Array<{
      id: string;
      productName: string;
      variantName: string;
      unitPrice: { toNumber?: () => number } | number;
      quantity: number;
      total: { toNumber?: () => number } | number;
    }>;
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
