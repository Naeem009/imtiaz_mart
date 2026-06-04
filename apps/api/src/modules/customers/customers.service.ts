import { Injectable, NotFoundException } from "@nestjs/common";
import type { CustomerAddressDto } from "@imtiaz-mart/shared";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

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

  async listAddresses(userId: string): Promise<CustomerAddressDto[]> {
    const customer = await this.ensureCustomer(userId);
    const addresses = await this.prisma.client.customerAddress.findMany({
      where: { customerId: customer.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return addresses.map(this.mapAddress);
  }

  async createAddress(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<CustomerAddressDto> {
    const customer = await this.ensureCustomer(userId);
    const isDefault = dto.isDefault ?? false;

    if (isDefault) {
      await this.prisma.client.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const hasAny = await this.prisma.client.customerAddress.count({
      where: { customerId: customer.id },
    });

    const address = await this.prisma.client.customerAddress.create({
      data: {
        id: uuidv7(),
        customerId: customer.id,
        label: dto.label ?? "Home",
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country ?? "PK",
        phone: dto.phone,
        isDefault: isDefault || hasAny === 0,
      },
    });

    return this.mapAddress(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<CustomerAddressDto> {
    const customer = await this.ensureCustomer(userId);
    const existing = await this.prisma.client.customerAddress.findFirst({
      where: { id: addressId, customerId: customer.id },
    });
    if (!existing) throw new NotFoundException("Address not found");

    if (dto.isDefault) {
      await this.prisma.client.customerAddress.updateMany({
        where: { customerId: customer.id },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.client.customerAddress.update({
      where: { id: addressId },
      data: {
        label: dto.label,
        line1: dto.line1,
        line2: dto.line2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        isDefault: dto.isDefault,
      },
    });

    return this.mapAddress(updated);
  }

  async deleteAddress(userId: string, addressId: string) {
    const customer = await this.ensureCustomer(userId);
    const existing = await this.prisma.client.customerAddress.findFirst({
      where: { id: addressId, customerId: customer.id },
    });
    if (!existing) throw new NotFoundException("Address not found");

    await this.prisma.client.customerAddress.delete({
      where: { id: addressId },
    });

    if (existing.isDefault) {
      const next = await this.prisma.client.customerAddress.findFirst({
        where: { customerId: customer.id },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await this.prisma.client.customerAddress.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: "Address deleted" };
  }

  private mapAddress(addr: {
    id: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string;
    country: string;
    phone: string | null;
    isDefault: boolean;
  }): CustomerAddressDto {
    return {
      id: addr.id,
      label: addr.label,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone,
      isDefault: addr.isDefault,
    };
  }
}
