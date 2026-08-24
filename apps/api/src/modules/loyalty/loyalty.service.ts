import { BadRequestException, Injectable } from "@nestjs/common";
import type { RewardAccountDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";

const POINT_VALUE = 1;
const MAX_REDEEM_RATIO = 0.2;

@Injectable()
export class LoyaltyService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  async getAccount(userId: string): Promise<RewardAccountDto> {
    const account = await this.ensureAccount(userId);
    const transactions = await this.prisma.client.rewardTransaction.findMany({
      where: { accountId: account.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return {
      balance: account.balance,
      lifetime: account.lifetime,
      transactions: transactions.map((row) => ({
        id: row.id,
        points: row.points,
        type: row.type,
        note: row.note,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }

  async ensureAccount(userId: string) {
    const customer = await this.customers.ensureCustomer(userId);
    const existing = await this.prisma.client.rewardAccount.findUnique({
      where: { customerId: customer.id },
    });
    if (existing) return existing;
    return this.prisma.client.rewardAccount.create({
      data: { id: uuidv7(), customerId: customer.id },
    });
  }

  redeemableValue(points: number) {
    return points * POINT_VALUE;
  }

  maxRedeemable(subtotal: number, balance: number) {
    const cap = Math.floor(subtotal * MAX_REDEEM_RATIO);
    return Math.min(balance, cap);
  }

  async redeem(userId: string, points: number, orderId: string, subtotal: number) {
    const account = await this.ensureAccount(userId);
    const allowed = this.maxRedeemable(subtotal, account.balance);
    if (points > allowed) {
      throw new BadRequestException(`You can redeem up to ${allowed} points on this order`);
    }
    if (points < 1) return 0;

    await this.prisma.client.rewardAccount.update({
      where: { id: account.id },
      data: { balance: { decrement: points } },
    });
    await this.prisma.client.rewardTransaction.create({
      data: {
        id: uuidv7(),
        accountId: account.id,
        points: -points,
        type: "REDEEM",
        note: "Checkout redemption",
        orderId,
      },
    });
    return points;
  }

  async earn(userId: string, orderId: string, paidTotal: number) {
    const points = Math.floor(paidTotal / 100);
    if (points < 1) return 0;
    const account = await this.ensureAccount(userId);
    await this.prisma.client.rewardAccount.update({
      where: { id: account.id },
      data: { balance: { increment: points }, lifetime: { increment: points } },
    });
    await this.prisma.client.rewardTransaction.create({
      data: {
        id: uuidv7(),
        accountId: account.id,
        points,
        type: "EARN",
        note: "Order reward",
        orderId,
      },
    });
    return points;
  }
}
