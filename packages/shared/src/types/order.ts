export interface OrderItemDto {
  id: string;
  productName: string;
  variantName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingName: string;
  shippingLine1: string;
  shippingLine2: string | null;
  shippingCity: string;
  shippingPostal: string;
  shippingCountry: string;
  createdAt: string;
  items: OrderItemDto[];
}
