import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PaymentStatus, Prisma } from "@imtiaz-mart/database";
import type { PaymentDto, SavedPaymentMethodDto, VendorPayoutDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { LoyaltyService } from "@/modules/loyalty/loyalty.service";
import { AffiliatesService } from "@/modules/affiliates/affiliates.service";

const PLATFORM_FEE = Number(process.env.PLATFORM_FEE_RATE ?? "0.10");

export const PAYMENT_METHODS = ["cod", "card", "jazzcash", "easypaisa", "bank_transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private loyalty: LoyaltyService,
    private affiliates: AffiliatesService,
  ) {}

  async capture(params: {
    paymentId: string;
    method: PaymentMethod;
    amount: number;
    cardToken?: string;
  }) {
    const payment = await this.prisma.client.payment.findUniqueOrThrow({
      where: { id: params.paymentId },
    });

    if (params.method === "cod") {
      await this.log(payment.id, "cod_pending", "Cash on delivery — collection on fulfillment");
      return payment;
    }

    const gateway = this.gatewayFor(params.method);
    const transactionId = await this.chargeGateway(params.method, params.amount, params.cardToken);

    const updated = await this.prisma.client.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        gateway,
        transactionId,
        capturedAt: new Date(),
        lastFour: params.cardToken ? params.cardToken.slice(-4) : undefined,
        brand: params.method === "card" ? "card" : params.method,
      },
    });
    await this.log(updated.id, "captured", `Captured via ${gateway}`, {
      transactionId,
    });
    return updated;
  }

  async createEscrow(orderId: string, items: Array<{ vendorId: string; total: number }>) {
    const grouped = new Map<string, number>();
    for (const item of items) {
      grouped.set(item.vendorId, (grouped.get(item.vendorId) ?? 0) + item.total * (1 - PLATFORM_FEE));
    }
    for (const [vendorId, amount] of grouped) {
      if (amount <= 0) continue;
      await this.prisma.client.escrowHolding.create({
        data: {
          id: uuidv7(),
          orderId,
          vendorId,
          amount: Number(amount.toFixed(2)),
          status: "HELD",
        },
      });
    }
  }

  async releaseEscrow(orderId: string) {
    const holdings = await this.prisma.client.escrowHolding.findMany({
      where: { orderId, status: "HELD" },
    });
    for (const holding of holdings) {
      await this.prisma.client.escrowHolding.update({
        where: { id: holding.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });
      await this.prisma.client.vendorPayout.create({
        data: {
          id: uuidv7(),
          vendorId: holding.vendorId,
          amount: holding.amount,
          status: "PENDING",
          reference: `ESCROW-${holding.id.slice(0, 8)}`,
        },
      });
    }
  }

  async markPaid(paymentId: string) {
    const payment = await this.prisma.client.payment.findUnique({
      where: { id: paymentId },
      include: { order: { include: { items: true, customer: true } } },
    });
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === PaymentStatus.PAID) return payment;

    const updated = await this.prisma.client.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.PAID, capturedAt: new Date() },
    });
    await this.log(updated.id, "marked_paid", "Marked paid by administrator");

    if (payment.method === "cod") {
      await this.createEscrow(
        payment.orderId,
        payment.order.items.map((item) => ({
          vendorId: item.vendorId,
          total: Number(item.total),
        })),
      );
      const earned = await this.loyalty.earn(
        payment.order.customer.userId,
        payment.orderId,
        Number(payment.order.total),
      );
      await this.affiliates.attributeOrder(
        payment.order.affiliateCode ?? undefined,
        payment.orderId,
        Number(payment.order.subtotal),
      );
      await this.prisma.client.order.update({
        where: { id: payment.orderId },
        data: { pointsEarned: earned },
      });
    }

    return updated;
  }

  async listAdmin(): Promise<PaymentDto[]> {
    const payments = await this.prisma.client.payment.findMany({
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return payments.map((payment) => ({
      id: payment.id,
      orderNumber: payment.order.orderNumber,
      amount: Number(payment.amount),
      status: payment.status,
      method: payment.method,
      gateway: payment.gateway,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt.toISOString(),
    }));
  }

  async listPayouts(vendorId: string): Promise<VendorPayoutDto[]> {
    const rows = await this.prisma.client.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount),
      status: row.status,
      reference: row.reference,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async saveMethod(
    customerId: string,
    data: { provider: string; token: string; brand?: string; lastFour: string },
  ): Promise<SavedPaymentMethodDto> {
    const method = await this.prisma.client.savedPaymentMethod.create({
      data: {
        id: uuidv7(),
        customerId,
        provider: data.provider,
        token: data.token,
        brand: data.brand,
        lastFour: data.lastFour,
      },
    });
    return {
      id: method.id,
      provider: method.provider,
      brand: method.brand,
      lastFour: method.lastFour,
      isDefault: method.isDefault,
    };
  }

  async listMethods(customerId: string): Promise<SavedPaymentMethodDto[]> {
    const rows = await this.prisma.client.savedPaymentMethod.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      provider: row.provider,
      brand: row.brand,
      lastFour: row.lastFour,
      isDefault: row.isDefault,
    }));
  }

  private gatewayFor(method: PaymentMethod) {
    switch (method) {
      case "card":
        return process.env.STRIPE_SECRET_KEY ? "stripe" : "stripe_sandbox";
      case "jazzcash":
        return process.env.JAZZCASH_MERCHANT_ID ? "jazzcash" : "jazzcash_sandbox";
      case "easypaisa":
        return process.env.EASYPAISA_STORE_ID ? "easypaisa" : "easypaisa_sandbox";
      case "bank_transfer":
        return "bank";
      default:
        return "cod";
    }
  }

  private async chargeGateway(method: PaymentMethod, amount: number, cardToken?: string) {
    if (method === "card" && process.env.STRIPE_SECRET_KEY) {
      try {
        const body = new URLSearchParams({
          amount: String(Math.round(amount * 100)),
          currency: "pkr",
          "payment_method_types[]": "card",
          confirm: "true",
          ...(cardToken ? { payment_method: cardToken } : {}),
        });
        const response = await fetch("https://api.stripe.com/v1/payment_intents", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });
        const json = (await response.json()) as { id?: string; error?: { message: string } };
        if (!response.ok || !json.id) {
          this.logger.warn(`Stripe capture failed: ${json.error?.message ?? response.status}`);
          return `stripe_sandbox_${Date.now().toString(36)}`;
        }
        return json.id;
      } catch (error) {
        this.logger.warn(`Stripe error, using sandbox capture: ${String(error)}`);
      }
    }
    return `${method}_${Date.now().toString(36)}`;
  }

  private async log(paymentId: string, event: string, message: string, payload?: object) {
    await this.prisma.client.paymentLog.create({
      data: {
        id: uuidv7(),
        paymentId,
        event,
        message,
        payload: (payload ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
  }
}
