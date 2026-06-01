import { PrismaClient, ProductStatus } from "@prisma/client";
import { v7 as uuidv7 } from "uuid";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Electronics", slug: "electronics", imageUrl: "bg-blue-100", sortOrder: 1 },
  { name: "Fashion", slug: "fashion", imageUrl: "bg-rose-100", sortOrder: 2 },
  { name: "Home & Living", slug: "home-living", imageUrl: "bg-amber-100", sortOrder: 3 },
  { name: "Beauty", slug: "beauty", imageUrl: "bg-pink-100", sortOrder: 4 },
  { name: "Sports", slug: "sports", imageUrl: "bg-green-100", sortOrder: 5 },
  { name: "Groceries", slug: "groceries", imageUrl: "bg-lime-100", sortOrder: 6 },
  { name: "Books", slug: "books", imageUrl: "bg-violet-100", sortOrder: 7 },
  { name: "Toys", slug: "toys", imageUrl: "bg-cyan-100", sortOrder: 8 },
];

const BRANDS = [
  { name: "Samsung", slug: "samsung" },
  { name: "Nike", slug: "nike" },
  { name: "Apple", slug: "apple" },
  { name: "Sony", slug: "sony" },
  { name: "Adidas", slug: "adidas" },
  { name: "Unilever", slug: "unilever" },
];

const VENDORS = [
  { name: "TechHub PK", slug: "techhub-pk", rating: 4.9, logoUrl: "bg-blue-200" },
  { name: "Style Avenue", slug: "style-avenue", rating: 4.7, logoUrl: "bg-rose-200" },
  { name: "Home Essentials", slug: "home-essentials", rating: 4.8, logoUrl: "bg-amber-200" },
  { name: "Glow Naturals", slug: "glow-naturals", rating: 4.6, logoUrl: "bg-pink-200" },
  { name: "Gadget World", slug: "gadget-world", rating: 4.9, logoUrl: "bg-zinc-200" },
  { name: "FitLife Store", slug: "fitlife-store", rating: 4.5, logoUrl: "bg-sky-200" },
];

const PRODUCTS = [
  {
    name: "Wireless Noise-Cancel Headphones",
    slug: "wireless-noise-cancel-headphones",
    price: 12999,
    compareAtPrice: 18999,
    rating: 4.8,
    reviewCount: 324,
    badge: "Best Seller",
    categorySlug: "electronics",
    brandSlug: "sony",
    vendorSlug: "techhub-pk",
    imageUrl: "bg-slate-200",
  },
  {
    name: "Premium Cotton Kurta",
    slug: "premium-cotton-kurta",
    price: 3499,
    compareAtPrice: 4999,
    rating: 4.6,
    reviewCount: 128,
    badge: "New",
    categorySlug: "fashion",
    brandSlug: "nike",
    vendorSlug: "style-avenue",
    imageUrl: "bg-stone-200",
  },
  {
    name: "Smart Watch Pro Series",
    slug: "smart-watch-pro-series",
    price: 24999,
    rating: 4.9,
    reviewCount: 512,
    categorySlug: "electronics",
    brandSlug: "apple",
    vendorSlug: "gadget-world",
    imageUrl: "bg-zinc-200",
  },
  {
    name: "Organic Skincare Set",
    slug: "organic-skincare-set",
    price: 5999,
    compareAtPrice: 7999,
    rating: 4.7,
    reviewCount: 89,
    categorySlug: "beauty",
    brandSlug: "unilever",
    vendorSlug: "glow-naturals",
    imageUrl: "bg-pink-200",
  },
  {
    name: "Running Shoes Ultra",
    slug: "running-shoes-ultra",
    price: 8999,
    rating: 4.5,
    reviewCount: 201,
    categorySlug: "sports",
    brandSlug: "adidas",
    vendorSlug: "fitlife-store",
    imageUrl: "bg-sky-200",
  },
  {
    name: "Stainless Steel Cookware Set",
    slug: "stainless-steel-cookware-set",
    price: 11999,
    compareAtPrice: 14999,
    rating: 4.4,
    reviewCount: 67,
    categorySlug: "home-living",
    vendorSlug: "home-essentials",
    imageUrl: "bg-amber-200",
  },
  {
    name: 'LED Smart TV 55"',
    slug: "led-smart-tv-55",
    price: 89999,
    compareAtPrice: 109999,
    rating: 4.8,
    reviewCount: 156,
    badge: "Top Rated",
    categorySlug: "electronics",
    brandSlug: "samsung",
    vendorSlug: "techhub-pk",
    imageUrl: "bg-indigo-200",
  },
  {
    name: "Designer Handbag",
    slug: "designer-handbag",
    price: 15999,
    rating: 4.6,
    reviewCount: 94,
    categorySlug: "fashion",
    vendorSlug: "style-avenue",
    imageUrl: "bg-rose-200",
  },
];

export async function seedCatalog() {
  const categoryIds = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, imageUrl: cat.imageUrl, sortOrder: cat.sortOrder },
      create: { id: uuidv7(), ...cat },
    });
    categoryIds.set(cat.slug, row.id);
  }

  const brandIds = new Map<string, string>();
  for (const brand of BRANDS) {
    const row = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: { name: brand.name },
      create: { id: uuidv7(), ...brand },
    });
    brandIds.set(brand.slug, row.id);
  }

  const vendorIds = new Map<string, string>();
  for (const vendor of VENDORS) {
    const row = await prisma.vendor.upsert({
      where: { slug: vendor.slug },
      update: {
        name: vendor.name,
        rating: vendor.rating,
        logoUrl: vendor.logoUrl,
        isVerified: true,
      },
      create: {
        id: uuidv7(),
        name: vendor.name,
        slug: vendor.slug,
        rating: vendor.rating,
        logoUrl: vendor.logoUrl,
        isVerified: true,
      },
    });
    vendorIds.set(vendor.slug, row.id);
  }

  for (const p of PRODUCTS) {
    const categoryId = categoryIds.get(p.categorySlug)!;
    const vendorId = vendorIds.get(p.vendorSlug)!;
    const brandId = p.brandSlug ? brandIds.get(p.brandSlug) : undefined;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge,
        status: ProductStatus.ACTIVE,
      },
      create: {
        id: uuidv7(),
        name: p.name,
        slug: p.slug,
        shortDescription: `Premium ${p.name} from verified vendors on Imtiaz Mart.`,
        description: `Shop ${p.name} with fast delivery and secure checkout. Authentic products from trusted sellers.`,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        rating: p.rating,
        reviewCount: p.reviewCount,
        badge: p.badge,
        status: ProductStatus.ACTIVE,
        categoryId,
        brandId,
        vendorId,
      },
    });

    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });
    if (!existingImage) {
      await prisma.productImage.create({
        data: {
          id: uuidv7(),
          productId: product.id,
          url: p.imageUrl,
          alt: p.name,
          isPrimary: true,
          sortOrder: 0,
        },
      });
    }

    const variantExists = await prisma.productVariant.findFirst({
      where: { productId: product.id },
    });
    if (!variantExists) {
      await prisma.productVariant.create({
        data: {
          id: uuidv7(),
          productId: product.id,
          name: "Default",
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          stock: 50,
        },
      });
    }
  }

  console.log(
    `Seeded catalog: ${CATEGORIES.length} categories, ${BRANDS.length} brands, ${VENDORS.length} vendors, ${PRODUCTS.length} products`,
  );
}
