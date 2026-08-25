import type { PaginatedProducts, ProductListItem } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";

export async function searchProductsClient(
  query: string,
  limit = 8,
  signal?: AbortSignal,
): Promise<{ items: ProductListItem[]; total: number }> {
  const q = query.trim();
  if (!q) return { items: [], total: 0 };

  const params = new URLSearchParams({
    q,
    page: "1",
    limit: String(limit),
    sort: "rating",
  });
  const res = await fetch(`${siteConfig.apiUrl}/products/search?${params}`, {
    signal,
    cache: "no-store",
  });
  if (!res.ok) return { items: [], total: 0 };
  const data = (await res.json()) as PaginatedProducts;
  return { items: data.data ?? [], total: data.meta?.total ?? data.data?.length ?? 0 };
}
