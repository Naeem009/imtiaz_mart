import { Injectable } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async ensureCustomer(userId: string) {
    const existing = await this.prisma.client.customer.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    return this.prisma.client.customer.create({
      data: { id: uuidv7(), userId },
    });
  }

  async getCustomerByUserId(userId: string) {
    return this.prisma.client.customer.findUnique({
      where: { userId },
      include: { addresses: { orderBy: { isDefault: "desc" } } },
    });
  }
}
