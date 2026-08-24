import type { BannerDto, ProductListItem, ReviewDto } from "@imtiaz-mart/shared";
import { fetchBrands, fetchCategories, fetchProducts, fetchRecommended } from "@/lib/catalog/fetch";
import { fetchBanners, fetchBlogs, fetchProductReviews } from "@/lib/commerce/api";
import { fetchPublicVendors } from "@/lib/vendor/api";

export interface HomeHeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  imageUrl?: string;
}

export interface HomeAnnouncement {
  text: string;
  href: string;
}

export interface HomeReviewCard {
  id: string;
  author: string;
  rating: number;
  text: string;
  product: string;
  date: string;
}

const DEFAULT_HERO: HomeHeroSlide[] = [
  {
    id: "default-shop",
    title: "Pakistan's premium marketplace",
    subtitle: "Shop trusted vendors, fast delivery, and secure checkout.",
    cta: "Shop now",
    href: "/shop",
    gradient: "from-slate-900 via-blue-900 to-slate-800",
  },
];

const DEFAULT_ANNOUNCEMENT: HomeAnnouncement = {
  text: "Free shipping on orders over Rs. 2,999",
  href: "/deals",
};

const HERO_GRADIENTS = [
  "from-slate-900 via-blue-900 to-slate-800",
  "from-orange-600 via-red-600 to-rose-700",
  "from-emerald-800 via-teal-800 to-slate-900",
];

function uniqueProducts(lists: ProductListItem[][]): ProductListItem[] {
  const seen = new Set<string>();
  const result: ProductListItem[] = [];
  for (const list of lists) {
    for (const product of list) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      result.push(product);
    }
  }
  return result;
}

function mapBannerToSlide(banner: BannerDto, index: number): HomeHeroSlide {
  const image = banner.imageUrl?.trim() ?? "";
  const isImage =
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("/");
  const isGradient = image.startsWith("from-") || image.includes(" via-");

  return {
    id: banner.id,
    title: banner.title,
    subtitle: "Shop verified vendors on ATVOO",
    cta: "Shop now",
    href: banner.href || "/shop",
    gradient: isGradient ? image : HERO_GRADIENTS[index % HERO_GRADIENTS.length],
    imageUrl: isImage ? image : undefined,
  };
}

function endOfUtcDay(): string {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function toReviewCard(review: ReviewDto, productName: string): HomeReviewCard {
  return {
    id: review.id,
    author: review.authorName,
    rating: review.rating,
    text: review.body,
    product: review.productName ?? productName,
    date: new Date(review.createdAt).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
    }),
  };
}

export async function loadHomePage() {
  const [
    newest,
    bestsellers,
    rated,
    trendingResult,
    recommended,
    categories,
    brands,
    vendors,
    homeBanners,
    announcementBanners,
    posts,
  ] = await Promise.all([
    fetchProducts({ page: 1, limit: 8, sort: "newest" }),
    fetchProducts({ page: 1, limit: 8, sort: "bestseller" }),
    fetchProducts({ page: 1, limit: 8, sort: "rating" }),
    fetchProducts({ page: 1, limit: 8, sort: "trending" }),
    fetchRecommended(),
    fetchCategories(),
    fetchBrands(),
    fetchPublicVendors(),
    fetchBanners("home"),
    fetchBanners("announcement"),
    fetchBlogs(),
  ]);

  const newestProducts = newest.data;
  const bestsellerProducts = bestsellers.data;
  const topRated = rated.data;
  const trending = trendingResult.data;
  const featured = recommended.length ? recommended.slice(0, 8) : newestProducts;
  const flashSale = uniqueProducts([
    newestProducts,
    bestsellerProducts,
    topRated,
    trending,
    featured,
  ]).filter(
    (product) => product.compareAtPrice !== null && product.compareAtPrice > product.price,
  );

  const reviewSources = featured.filter((product) => product.reviewCount > 0).slice(0, 3);
  const reviewBatches = await Promise.all(
    reviewSources.map(async (product) => {
      const reviews = await fetchProductReviews(product.slug);
      return reviews.slice(0, 1).map((review) => toReviewCard(review, product.name));
    }),
  );

  const announcementBanner = announcementBanners[0];

  return {
    announcement: announcementBanner
      ? { text: announcementBanner.title, href: announcementBanner.href || "/deals" }
      : DEFAULT_ANNOUNCEMENT,
    slides: homeBanners.length ? homeBanners.map(mapBannerToSlide) : DEFAULT_HERO,
    featuredCategories: categories.slice(0, 6),
    categories: categories.slice(0, 8),
    flashSale,
    flashSaleEndsAt: endOfUtcDay(),
    featured,
    trending,
    bestsellers: bestsellerProducts,
    newArrivals: newestProducts,
    topRated,
    recommended: recommended.slice(0, 8),
    vendors: vendors.slice(0, 4),
    brands: brands.slice(0, 8),
    reviews: reviewBatches.flat().slice(0, 3),
    posts: posts.slice(0, 3),
  };
}

export type HomePageData = Awaited<ReturnType<typeof loadHomePage>>;
