export interface VendorProfileDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  productCount: number;
  orderCount: number;
}

export interface VendorOrderItemDto {
  id: string;
  productName: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendorOrderDto {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  customerName: string;
  items: VendorOrderItemDto[];
  vendorTotal: number;
}

export interface VendorProductDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  status: string;
  stock: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  primaryImage: string | null;
}
