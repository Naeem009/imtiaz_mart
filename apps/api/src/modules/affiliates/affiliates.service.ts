import { Injectable } from "@nestjs/common";
import type { AffiliateDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class AffiliatesService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string): Promise<AffiliateDto> {
    const existing = await this.prisma.client.affiliate.findUnique({ where: { userId } });
    if (existing) return this.toDto(existing.id);

    const role = await this.prisma.client.role.findUnique({ where: { slug: "affiliate" } });
    if (role) {
      await this.prisma.client.userRole.upsert({
        where: { userId_roleId: { userId, roleId: role.id } },
        create: { userId, roleId: role.id },
        update: {},
      });
    }

    const created = await this.prisma.client.affiliate.create({
      data: {
        id: uuidv7(),
        userId,
        code: `ATV-${userId.slice(0, 8).toUpperCase()}`,
      },
    });
    return this.toDto(created.id);
  }

  async me(userId: string): Promise<AffiliateDto | null> {
    const affiliate = await this.prisma.client.affiliate.findUnique({ where: { userId } });
    if (!affiliate) return null;
    return this.toDto(affiliate.id);
  }

  async attributeOrder(code: string | undefined, orderId: string, subtotal: number) {
    if (!code) return;
    const affiliate = await this.prisma.client.affiliate.findFirst({
      where: { code, status: "ACTIVE" },
    });
    if (!affiliate) return;
    const amount = Number((subtotal * Number(affiliate.commissionRate)).toFixed(2));
    if (amount <= 0) return;
    await this.prisma.client.affiliateCommission.create({
      data: {
        id: uuidv7(),
        affiliateId: affiliate.id,
        orderId,
        amount,
        status: "PENDING",
      },
    });
  }

  private async toDto(id: string): Promise<AffiliateDto> {
    const affiliate = await this.prisma.client.affiliate.findUniqueOrThrow({
      where: { id },
      include: { commissions: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const pending = affiliate.commissions
      .filter((row) => row.status === "PENDING")
      .reduce((sum, row) => sum + Number(row.amount), 0);
    const paid = affiliate.commissions
      .filter((row) => row.status === "PAID")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    return {
      code: affiliate.code,
      status: affiliate.status,
      commissionRate: Number(affiliate.commissionRate),
      referralUrl: `${origin}/?ref=${affiliate.code}`,
      pending,
      paid,
      commissions: affiliate.commissions.map((row) => ({
        id: row.id,
        orderId: row.orderId,
        amount: Number(row.amount),
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      })),
    };
  }
}
