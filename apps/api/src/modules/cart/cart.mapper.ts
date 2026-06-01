import type { CartDto } from "@imtiaz-mart/shared";

type CartWithItems = {
  id: string;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      images: { url: string; isPrimary: boolean }[];
    };
    variant: { id: string; name: string; price: { toNumber?: () => number } | number; stock: number };
  }>;
};

function toNum(v: { toNumber?: () => number } | number): number {
  return typeof v === "number" ? v : Number(v.toNumber?.() ?? v);
}

export function mapCart(cart: CartWithItems): CartDto {
  const items = cart.items.map((item) => {
    const price = toNum(item.variant.price);
    const primary =
      item.product.images.find((i) => i.isPrimary) ?? item.product.images[0];
    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        primaryImage: primary?.url ?? null,
      },
      variant: {
        id: item.variant.id,
        name: item.variant.name,
        price,
        stock: item.variant.stock,
      },
      lineTotal: price * item.quantity,
    };
  });

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
  };
}
