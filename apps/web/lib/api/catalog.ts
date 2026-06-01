import type {
  BrandListItem,
  CategoryListItem,
  PaginatedProducts,
  ProductDetail,
  ProductListItem,
} from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";

export interface ProductsQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  brand?: string;
  vendor?: string;
  sort?: string;
}

function buildQuery(params: ProductsQuery): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${siteConfig.apiUrl}${path}`, {
      ...init,
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function getProducts(
  params: ProductsQuery = {},
): Promise<PaginatedProducts | null> {
  const qs = buildQuery(params);
  return apiFetch<PaginatedProducts>(`/products?${qs}`);
}

export async function searchProducts(
  params: ProductsQuery,
): Promise<PaginatedProducts | null> {
  const qs = buildQuery(params);
  return apiFetch<PaginatedProducts>(`/products/search?${qs}`);
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  return apiFetch<ProductDetail>(`/products/${slug}`);
}

export async function getRecommendedProducts(
  limit = 8,
): Promise<ProductListItem[] | null> {
  return apiFetch<ProductListItem[]>(
    `/products/recommendations?limit=${limit}`,
  );
}

export async function getCategories(): Promise<CategoryListItem[] | null> {
  return apiFetch<CategoryListItem[]>("/categories");
}

export async function getCategory(slug: string) {
  return apiFetch<CategoryListItem & { description?: string | null }>(
    `/categories/${slug}`,
  );
}

export async function getCategoryProducts(
  slug: string,
  params: ProductsQuery = {},
): Promise<PaginatedProducts | null> {
  const qs = buildQuery(params);
  return apiFetch<PaginatedProducts>(`/categories/${slug}/products?${qs}`);
}

export async function getBrands(): Promise<BrandListItem[] | null> {
  return apiFetch<BrandListItem[]>("/brands");
}
