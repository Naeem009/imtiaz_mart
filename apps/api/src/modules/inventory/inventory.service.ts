import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InventoryTransactionType } from "@imtiaz-mart/database";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { VendorsService } from "@/modules/vendors/vendors.service";
import { AdjustInventoryDto, CreateWarehouseDto } from "./inventory.dto";

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService, private vendors: VendorsService) {}

  async list(userId: string) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const warehouses = await this.ensureDefaultWarehouse(vendor.id);
    const inventory = await this.prisma.client.inventory.findMany({
      where: { warehouse: { vendorId: vendor.id, isActive: true } },
      include: {
        warehouse: true,
        variant: { include: { product: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy: [{ warehouseId: "asc" }, { updatedAt: "desc" }],
    });
    return { warehouses, items: inventory };
  }

  async createWarehouse(userId: string, dto: CreateWarehouseDto) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const name = dto.name.trim();
    if (!name) throw new BadRequestException("Warehouse name is required");
    try {
      return await this.prisma.client.warehouse.create({
        data: { id: uuidv7(), vendorId: vendor.id, name, city: dto.city?.trim(), country: dto.country?.trim() || "PK" },
      });
    } catch {
      throw new ConflictException("A warehouse with this name already exists");
    }
  }

  async adjust(userId: string, warehouseId: string, dto: AdjustInventoryDto) {
    const vendor = await this.vendors.resolveVendorForUser(userId);
    const warehouse = await this.prisma.client.warehouse.findFirst({ where: { id: warehouseId, vendorId: vendor.id, isActive: true } });
    if (!warehouse) throw new NotFoundException("Warehouse not found");
    if (dto.delta === 0) throw new BadRequestException("Inventory change cannot be zero");

    return this.prisma.client.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({ where: { id: dto.variantId, product: { vendorId: vendor.id, deletedAt: null } } });
      if (!variant) throw new NotFoundException("Product variant not found");
      const current = await tx.inventory.findUnique({ where: { warehouseId_variantId: { warehouseId, variantId: dto.variantId } } });
      const nextQuantity = (current?.quantity ?? 0) + dto.delta;
      if (nextQuantity < 0) throw new BadRequestException("Inventory cannot become negative");

      const inventory = current
        ? await tx.inventory.update({ where: { id: current.id }, data: { quantity: nextQuantity, lowStockThreshold: dto.lowStockThreshold ?? current.lowStockThreshold } })
        : await tx.inventory.create({ data: { id: uuidv7(), warehouseId, variantId: dto.variantId, quantity: nextQuantity, lowStockThreshold: dto.lowStockThreshold ?? 5 } });
      await tx.inventoryTransaction.create({ data: { id: uuidv7(), inventoryId: inventory.id, type: dto.type, delta: dto.delta, quantity: nextQuantity, reason: dto.reason?.trim(), createdById: userId } });

      const total = await tx.inventory.aggregate({ where: { variantId: dto.variantId }, _sum: { quantity: true } });
      await tx.productVariant.update({ where: { id: dto.variantId }, data: { stock: total._sum.quantity ?? 0 } });
      return inventory;
    });
  }

  private async ensureDefaultWarehouse(vendorId: string) {
    let warehouse = await this.prisma.client.warehouse.findFirst({ where: { vendorId, isActive: true }, orderBy: { createdAt: "asc" } });
    if (warehouse) return this.prisma.client.warehouse.findMany({ where: { vendorId, isActive: true }, orderBy: { createdAt: "asc" } });
    warehouse = await this.prisma.client.warehouse.create({ data: { id: uuidv7(), vendorId, name: "Main warehouse", country: "PK" } });
    const variants = await this.prisma.client.productVariant.findMany({ where: { product: { vendorId, deletedAt: null } } });
    if (variants.length) {
      await this.prisma.client.inventory.createMany({ data: variants.map((variant) => ({ id: uuidv7(), warehouseId: warehouse!.id, variantId: variant.id, quantity: variant.stock })) });
    }
    return [warehouse];
  }
}
