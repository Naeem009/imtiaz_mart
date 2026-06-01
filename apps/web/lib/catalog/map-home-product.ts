import type { ProductListItem } from "@imtiaz-mart/shared";
import type { HomeProduct } from "@/lib/data/homepage";

export function mapHomeProductToListItem(product: HomeProduct): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    compareAtPrice: product.compareAtPrice ?? null,
    rating: product.rating,
    reviewCount: product.reviewCount,
    badge: product.badge ?? null,
    primaryImage: product.image,
    vendor: {
      id: `vendor-${product.vendor}`,
      name: product.vendor,
      slug: product.vendor.toLowerCase().replace(/\s+/g, "-"),
      rating: 4.8,
    },
    category: { id: "cat-1", name: "Shop", slug: "electronics" },
    brand: null,
  };
}
