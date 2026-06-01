export interface CartItemDto {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    primaryImage: string | null;
  };
  variant: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  lineTotal: number;
}

export interface CartDto {
  id: string;
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
}
