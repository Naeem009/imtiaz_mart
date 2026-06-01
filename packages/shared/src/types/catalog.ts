export interface ProductImageDto {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
}

export interface ProductVendorDto {
  id: string;
  name: string;
  slug: string;
  rating: number;
}

export interface ProductBrandDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductCategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  primaryImage: string | null;
  vendor: ProductVendorDto;
  category: ProductCategoryDto;
  brand: ProductBrandDto | null;
}

export interface ProductDetail extends ProductListItem {
  description: string | null;
  shortDescription: string | null;
  images: ProductImageDto[];
  variants: ProductVariantDto[];
  sku: string | null;
}

export interface ProductVariantDto {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
}

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  productCount: number;
  children?: CategoryListItem[];
}

export interface BrandListItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  productCount: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: ProductListItem[];
  meta: PaginatedMeta;
}
