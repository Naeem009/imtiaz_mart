import type { PaginatedProducts } from "@imtiaz-mart/shared";
import {
  bestSellers,
  categories as mockCategories,
  featuredProducts,
  newArrivals,
  popularBrands,
  topRated,
  trendingProducts,
} from "@/lib/data/homepage";
import { mapHomeProductToListItem } from "@/lib/catalog/map-home-product";

export function getMockProductsList(
  source = featuredProducts.map(mapHomeProductToListItem),
): PaginatedProducts {
  return {
    data: source,
    meta: { page: 1, limit: 20, total: source.length, totalPages: 1 },
  };
}

export function resolveMockProducts(params: {
  sort?: string;
  category?: string;
  q?: string;
}): PaginatedProducts {
  let list = featuredProducts.map(mapHomeProductToListItem);

  if (params.sort === "bestseller") {
    list = bestSellers.map(mapHomeProductToListItem);
  } else if (params.sort === "newest") {
    list = newArrivals.map(mapHomeProductToListItem);
  } else if (params.sort === "rating") {
    list = topRated.map(mapHomeProductToListItem);
  } else if (params.sort === "trending") {
    list = trendingProducts.map(mapHomeProductToListItem);
  }

  if (params.q) {
    const q = params.q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q));
  }

  return getMockProductsList(list);
}

export function getMockCategories() {
  return mockCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.image,
    productCount: c.productCount,
  }));
}

export function getMockBrands() {
  return popularBrands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: null,
    productCount: 0,
  }));
}
