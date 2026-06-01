export interface HomeCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}

export interface HomeProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  vendor: string;
  badge?: string;
  image: string;
}

export interface HomeVendor {
  id: string;
  name: string;
  slug: string;
  rating: number;
  productCount: number;
  image: string;
}

export interface HomeBrand {
  id: string;
  name: string;
  slug: string;
}

export interface HomeReview {
  id: string;
  author: string;
  rating: number;
  text: string;
  product: string;
  date: string;
}

export interface HomeBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
}

export const announcement = {
  text: "Free shipping on orders over Rs. 2,999 — Use code WELCOME10",
  href: "/deals",
};

export const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Summer Collection 2026",
    subtitle: "Up to 50% off from top vendors",
    cta: "Shop now",
    href: "/shop?sale=summer",
    gradient: "from-slate-900 via-blue-900 to-slate-800",
  },
  {
    id: "2",
    title: "Flash Sale Ends Tonight",
    subtitle: "Limited stock on electronics & fashion",
    cta: "View deals",
    href: "/deals/flash-sale",
    gradient: "from-orange-600 via-red-600 to-rose-700",
  },
  {
    id: "3",
    title: "New Vendor Spotlight",
    subtitle: "Discover premium local brands",
    cta: "Explore vendors",
    href: "/vendors",
    gradient: "from-emerald-800 via-teal-800 to-slate-900",
  },
];

export const featuredCategories: HomeCategory[] = [
  { id: "1", name: "Electronics", slug: "electronics", image: "bg-blue-100", productCount: 1240 },
  { id: "2", name: "Fashion", slug: "fashion", image: "bg-rose-100", productCount: 3420 },
  { id: "3", name: "Home & Living", slug: "home-living", image: "bg-amber-100", productCount: 890 },
  { id: "4", name: "Beauty", slug: "beauty", image: "bg-pink-100", productCount: 1560 },
  { id: "5", name: "Sports", slug: "sports", image: "bg-green-100", productCount: 720 },
  { id: "6", name: "Groceries", slug: "groceries", image: "bg-lime-100", productCount: 2100 },
];

export const categories: HomeCategory[] = [
  ...featuredCategories,
  { id: "7", name: "Books", slug: "books", image: "bg-violet-100", productCount: 450 },
  { id: "8", name: "Toys", slug: "toys", image: "bg-cyan-100", productCount: 380 },
];

const baseProducts: Omit<HomeProduct, "id">[] = [
  { name: "Wireless Noise-Cancel Headphones", slug: "wireless-noise-cancel-headphones", price: 12999, compareAtPrice: 18999, rating: 4.8, reviewCount: 324, vendor: "TechHub PK", badge: "Best Seller", image: "bg-slate-200" },
  { name: "Premium Cotton Kurta", slug: "premium-cotton-kurta", price: 3499, compareAtPrice: 4999, rating: 4.6, reviewCount: 128, vendor: "Style Avenue", badge: "New", image: "bg-stone-200" },
  { name: "Smart Watch Pro Series", slug: "smart-watch-pro-series", price: 24999, rating: 4.9, reviewCount: 512, vendor: "Gadget World", image: "bg-zinc-200" },
  { name: "Organic Skincare Set", slug: "organic-skincare-set", price: 5999, compareAtPrice: 7999, rating: 4.7, reviewCount: 89, vendor: "Glow Naturals", image: "bg-pink-200" },
  { name: "Running Shoes Ultra", slug: "running-shoes-ultra", price: 8999, rating: 4.5, reviewCount: 201, vendor: "FitLife Store", image: "bg-sky-200" },
  { name: "Stainless Steel Cookware Set", slug: "stainless-steel-cookware-set", price: 11999, compareAtPrice: 14999, rating: 4.4, reviewCount: 67, vendor: "Home Essentials", image: "bg-amber-200" },
  { name: "LED Smart TV 55\"", slug: "led-smart-tv-55", price: 89999, compareAtPrice: 109999, rating: 4.8, reviewCount: 156, vendor: "TechHub PK", badge: "Top Rated", image: "bg-indigo-200" },
  { name: "Designer Handbag", slug: "designer-handbag", price: 15999, rating: 4.6, reviewCount: 94, vendor: "Style Avenue", image: "bg-rose-200" },
];

function withIds(prefix: string): HomeProduct[] {
  return baseProducts.map((p, i) => ({
    ...p,
    id: `${prefix}-${i + 1}`,
  }));
}

export const featuredProducts = withIds("featured");
export const trendingProducts = withIds("trending").slice(0, 6);
export const bestSellers = withIds("bestseller");
export const newArrivals = withIds("new");
export const topRated = withIds("top").filter((p) => p.rating >= 4.7);
export const recommendedProducts = withIds("rec");
export const flashSaleProducts = withIds("flash").map((p) => ({
  ...p,
  compareAtPrice: Math.round(p.price * 1.4),
  price: Math.round(p.price * 0.7),
  badge: "Flash",
}));

export const featuredVendors: HomeVendor[] = [
  { id: "1", name: "TechHub PK", slug: "techhub-pk", rating: 4.9, productCount: 240, image: "bg-blue-200" },
  { id: "2", name: "Style Avenue", slug: "style-avenue", rating: 4.7, productCount: 580, image: "bg-rose-200" },
  { id: "3", name: "Home Essentials", slug: "home-essentials", rating: 4.8, productCount: 120, image: "bg-amber-200" },
  { id: "4", name: "Glow Naturals", slug: "glow-naturals", rating: 4.6, productCount: 95, image: "bg-pink-200" },
];

export const popularBrands: HomeBrand[] = [
  { id: "1", name: "Samsung", slug: "samsung" },
  { id: "2", name: "Nike", slug: "nike" },
  { id: "3", name: "Apple", slug: "apple" },
  { id: "4", name: "Sony", slug: "sony" },
  { id: "5", name: "Adidas", slug: "adidas" },
  { id: "6", name: "Unilever", slug: "unilever" },
];

export const customerReviews: HomeReview[] = [
  { id: "1", author: "Ayesha K.", rating: 5, text: "Fast delivery and genuine products. Best marketplace experience in Pakistan!", product: "Wireless Headphones", date: "2 days ago" },
  { id: "2", author: "Hassan R.", rating: 5, text: "Love the vendor variety. Found everything I needed in one place.", product: "Smart Watch Pro", date: "1 week ago" },
  { id: "3", author: "Fatima M.", rating: 4, text: "Great prices during flash sales. Customer support was very helpful.", product: "Skincare Set", date: "3 days ago" },
];

export const blogPosts: HomeBlogPost[] = [
  { id: "1", title: "10 Tips for Smart Online Shopping", slug: "smart-shopping-tips", excerpt: "Save more and shop safer with these expert marketplace tips.", category: "Guides", readTime: "5 min", image: "bg-slate-300" },
  { id: "2", title: "How to Choose the Right Vendor", slug: "choose-vendor", excerpt: "Verified sellers, ratings, and what to look for before you buy.", category: "Marketplace", readTime: "4 min", image: "bg-blue-200" },
  { id: "3", title: "Summer Fashion Trends 2026", slug: "summer-fashion-2026", excerpt: "Top styles from our featured vendors this season.", category: "Fashion", readTime: "6 min", image: "bg-rose-200" },
];

export const trustBadges = [
  { label: "Secure Payments", icon: "lock" as const },
  { label: "Free Returns", icon: "return" as const },
  { label: "Verified Vendors", icon: "verified" as const },
  { label: "24/7 Support", icon: "support" as const },
];

export const instagramPosts = [
  { id: "1", alt: "Fashion haul", gradient: "bg-gradient-to-br from-pink-300 to-rose-400" },
  { id: "2", alt: "Tech setup", gradient: "bg-gradient-to-br from-blue-300 to-indigo-400" },
  { id: "3", alt: "Home decor", gradient: "bg-gradient-to-br from-amber-300 to-orange-400" },
  { id: "4", alt: "Fitness gear", gradient: "bg-gradient-to-br from-green-300 to-emerald-400" },
  { id: "5", alt: "Beauty products", gradient: "bg-gradient-to-br from-purple-300 to-violet-400" },
  { id: "6", alt: "Food & groceries", gradient: "bg-gradient-to-br from-lime-300 to-teal-400" },
];

export interface HomeVideoReview {
  id: string;
  title: string;
  author: string;
  duration: string;
  gradient: string;
}

export const videoReviews: HomeVideoReview[] = [
  { id: "1", title: "Unboxing: Smart Watch Pro", author: "TechReviewer", duration: "3:42", gradient: "from-slate-800 to-slate-600" },
  { id: "2", title: "Honest Review: Skincare Set", author: "BeautyByFK", duration: "5:18", gradient: "from-rose-800 to-pink-700" },
  { id: "3", title: "Running Shoes Test", author: "FitPakistan", duration: "4:05", gradient: "from-blue-800 to-cyan-700" },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);
}
