import type { PaginatedProducts, ProductDetail, ProductListItem } from "@imtiaz-mart/shared";
import {
  getBrands,
  getCategories,
  getCategoryProducts,
  getCompareProducts,
  getProduct,
  getProducts,
  getRecommendedProducts,
  searchProducts,
  type ProductsQuery,
} from "@/lib/api/catalog";

function emptyProducts(params: ProductsQuery = {}): PaginatedProducts {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    data: [],
    meta: { page, limit, total: 0, totalPages: 0 },
  };
}

export async function fetchProducts(
  params: ProductsQuery = {},
): Promise<PaginatedProducts> {
  return (await getProducts(params)) ?? emptyProducts(params);
}

export async function fetchSearchProducts(
  params: ProductsQuery,
): Promise<PaginatedProducts> {
  return (await searchProducts(params)) ?? emptyProducts(params);
}

export async function fetchCategoryProducts(
  slug: string,
  params: ProductsQuery = {},
): Promise<PaginatedProducts> {
  return (await getCategoryProducts(slug, params)) ?? emptyProducts(params);
}

export async function fetchProduct(slug: string) {
  return getProduct(slug);
}

export async function fetchCategories() {
  return (await getCategories()) ?? [];
}

export async function fetchBrands() {
  return (await getBrands()) ?? [];
}

export async function fetchRecommended(): Promise<ProductListItem[]> {
  return (await getRecommendedProducts(8)) ?? [];
}

export async function fetchCompareProducts(ids: string[]): Promise<ProductDetail[]> {
  if (ids.length === 0) return [];
  return getCompareProducts(ids);
}
