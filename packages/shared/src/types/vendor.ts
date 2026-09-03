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
  variants: VendorProductVariantDto[];
  shortDescription: string | null;
  description: string | null;
  status: string;
  stock: number;
  rating: number;
  reviewCount: number;
  categoryName: string;
  categoryId: string;
  primaryImage: string | null;
  isEligibleSearch: boolean;
  isEligibleCheckout: boolean;
}

export interface VendorProductVariantDto {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
}
