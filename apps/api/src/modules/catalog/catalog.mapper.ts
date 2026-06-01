import type {
  Brand,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Vendor,
} from "@imtiaz-mart/database";
import type {
  ProductDetail,
  ProductListItem,
} from "@imtiaz-mart/shared";

type ProductWithRelations = Product & {
  category: Category;
  brand: Brand | null;
  vendor: Vendor;
  images: ProductImage[];
  variants?: ProductVariant[];
};

function toNumber(value: { toNumber?: () => number } | number): number {
  return typeof value === "number"
    ? value
    : Number(value.toNumber?.() ?? value);
}

export function mapProductListItem(product: ProductWithRelations): ProductListItem {
  const primary =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: toNumber(product.price),
    compareAtPrice: product.compareAtPrice
      ? toNumber(product.compareAtPrice)
      : null,
    rating: toNumber(product.rating),
    reviewCount: product.reviewCount,
    badge: product.badge,
    primaryImage: primary?.url ?? null,
    vendor: {
      id: product.vendor.id,
      name: product.vendor.name,
      slug: product.vendor.slug,
      rating: toNumber(product.vendor.rating),
    },
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    brand: product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          slug: product.brand.slug,
        }
      : null,
  };
}

export function mapProductDetail(product: ProductWithRelations): ProductDetail {
  return {
    ...mapProductListItem(product),
    description: product.description,
    shortDescription: product.shortDescription,
    sku: product.sku,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
    })),
    variants: (product.variants ?? []).map((v) => ({
      id: v.id,
      name: v.name,
      price: toNumber(v.price),
      compareAtPrice: v.compareAtPrice ? toNumber(v.compareAtPrice) : null,
      stock: v.stock,
    })),
  };
}
