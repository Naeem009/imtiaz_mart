import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ProductStatus } from "@imtiaz-mart/database";
import { v7 as uuidv7 } from "uuid";
import { PrismaService } from "@/modules/prisma/prisma.service";
import { CustomersService } from "@/modules/customers/customers.service";
import { mapCart } from "./cart.mapper";

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" as const } } },
      },
      variant: true,
    },
  },
};

export interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    private customers: CustomersService,
  ) {}

  async getCart(identity: CartIdentity) {
    const cart = await this.resolveCart(identity);
    return mapCart(cart);
  }

  async addItem(
    identity: CartIdentity,
    variantId: string,
    quantity: number,
  ) {
    const variant = await this.prisma.client.productVariant.findFirst({
      where: {
        id: variantId,
        product: { status: ProductStatus.ACTIVE, deletedAt: null },
      },
      include: { product: true },
    });
    if (!variant) throw new NotFoundException("Product variant not found");
    if (variant.stock < quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    const cart = await this.resolveCart(identity);
    const existing = await this.prisma.client.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId } },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (variant.stock < newQty) {
        throw new BadRequestException("Insufficient stock");
      }
      await this.prisma.client.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.client.cartItem.create({
        data: {
          id: uuidv7(),
          cartId: cart.id,
          productId: variant.productId,
          variantId,
          quantity,
        },
      });
    }

    return this.getCart(identity);
  }

  async updateItem(
    identity: CartIdentity,
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.resolveCart(identity);
    const item = await this.prisma.client.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { variant: true },
    });
    if (!item) throw new NotFoundException("Cart item not found");
    if (item.variant.stock < quantity) {
      throw new BadRequestException("Insufficient stock");
    }

    await this.prisma.client.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
    return this.getCart(identity);
  }

  async removeItem(identity: CartIdentity, itemId: string) {
    const cart = await this.resolveCart(identity);
    await this.prisma.client.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });
    return this.getCart(identity);
  }

  async clearCart(identity: CartIdentity) {
    const cart = await this.resolveCart(identity);
    await this.prisma.client.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
    return this.getCart(identity);
  }

  async resolveCartRecord(identity: CartIdentity) {
    return this.resolveCart(identity);
  }

  private async resolveCart(identity: CartIdentity) {
    let customerId: string | undefined;
    if (identity.userId) {
      const customer = await this.customers.ensureCustomer(identity.userId);
      customerId = customer.id;
    }

    if (customerId) {
      let cart = await this.prisma.client.cart.findUnique({
        where: { customerId },
        include: cartInclude,
      });
      if (!cart) {
        cart = await this.prisma.client.cart.create({
          data: { id: uuidv7(), customerId },
          include: cartInclude,
        });
      }
      if (identity.sessionId) {
        await this.mergeGuestCart(identity.sessionId, cart.id);
      }
      return this.prisma.client.cart.findUniqueOrThrow({
        where: { id: cart.id },
        include: cartInclude,
      });
    }

    if (!identity.sessionId) {
      throw new BadRequestException("Cart session required");
    }

    let cart = await this.prisma.client.cart.findUnique({
      where: { sessionId: identity.sessionId },
      include: cartInclude,
    });
    if (!cart) {
      cart = await this.prisma.client.cart.create({
        data: { id: uuidv7(), sessionId: identity.sessionId },
        include: cartInclude,
      });
    }
    return cart;
  }

  private async mergeGuestCart(sessionId: string, customerCartId: string) {
    const guestCart = await this.prisma.client.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
    if (!guestCart?.items.length) return;

    for (const item of guestCart.items) {
      const existing = await this.prisma.client.cartItem.findUnique({
        where: {
          cartId_variantId: {
            cartId: customerCartId,
            variantId: item.variantId,
          },
        },
      });
      if (existing) {
        await this.prisma.client.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + item.quantity },
        });
      } else {
        await this.prisma.client.cartItem.create({
          data: {
            id: uuidv7(),
            cartId: customerCartId,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          },
        });
      }
    }
    await this.prisma.client.cart.delete({ where: { id: guestCart.id } });
  }
}
