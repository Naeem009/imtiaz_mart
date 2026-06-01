import type { PaginatedProducts, ProductListItem } from "@imtiaz-mart/shared";
import {
  getBrands,
  getCategories,
  getCategoryProducts,
  getProduct,
  getProducts,
  getRecommendedProducts,
  searchProducts,
  type ProductsQuery,
} from "@/lib/api/catalog";
import {
  getMockBrands,
  getMockCategories,
  resolveMockProducts,
} from "@/lib/catalog/fallback";
import { mapHomeProductToListItem } from "@/lib/catalog/map-home-product";
import { featuredProducts } from "@/lib/data/homepage";

export async function fetchProducts(
  params: ProductsQuery = {},
): Promise<PaginatedProducts> {
  const data = await getProducts(params);
  return data ?? resolveMockProducts(params);
}

export async function fetchSearchProducts(
  params: ProductsQuery,
): Promise<PaginatedProducts> {
  const data = await searchProducts(params);
  return data ?? resolveMockProducts(params);
}

export async function fetchCategoryProducts(
  slug: string,
  params: ProductsQuery = {},
): Promise<PaginatedProducts> {
  const data = await getCategoryProducts(slug, params);
  if (data) return data;
  return resolveMockProducts({ ...params, category: slug });
}

export async function fetchProduct(slug: string) {
  const data = await getProduct(slug);
  if (data) return data;
  const mock = featuredProducts.find((p) => p.slug === slug);
  if (!mock) return null;
  const list = mapHomeProductToListItem(mock);
  return {
    ...list,
    description: `Full details for ${mock.name}. Connect the database to load live product content.`,
    shortDescription: mock.name,
    sku: null,
    images: [
      {
        id: "1",
        url: mock.image,
        alt: mock.name,
        isPrimary: true,
      },
    ],
    variants: [
      {
        id: "default",
        name: "Default",
        price: mock.price,
        compareAtPrice: mock.compareAtPrice ?? null,
        stock: 50,
      },
    ],
  };
}

export async function fetchCategories() {
  return (await getCategories()) ?? getMockCategories();
}

export async function fetchBrands() {
  return (await getBrands()) ?? getMockBrands();
}

export async function fetchRecommended(): Promise<ProductListItem[]> {
  const data = await getRecommendedProducts(8);
  if (data?.length) return data;
  return featuredProducts.map(mapHomeProductToListItem);
}
