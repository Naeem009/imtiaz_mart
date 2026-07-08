import { AnnouncementBar } from "@/components/home/announcement-bar";
import { BlogSection } from "@/components/home/blog-section";
import { BrandsSection } from "@/components/home/brands-section";
import { CategorySection } from "@/components/home/category-section";
import { FeatureStrip } from "@/components/home/feature-strip";
import { FlashSaleSection } from "@/components/home/flash-sale-section";
import { HeroSlider } from "@/components/home/hero-slider";
import { InstagramSection } from "@/components/home/instagram-section";
import { MarketplaceQuickLinks } from "@/components/home/marketplace-quick-links";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductSection } from "@/components/home/product-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { TrustBadges } from "@/components/home/trust-badges";
import { VendorsSection } from "@/components/home/vendors-section";
import { VideoReviewsSection } from "@/components/home/video-reviews-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  bestSellers,
  blogPosts,
  categories,
  customerReviews,
  featuredCategories,
  featuredProducts,
  featuredVendors,
  flashSaleProducts,
  heroSlides,
  instagramPosts,
  newArrivals,
  popularBrands,
  recommendedProducts,
  topRated,
  trendingProducts,
  videoReviews,
} from "@/lib/data/homepage";
import { siteConfig } from "@/config/site";

function getFlashSaleEnd(): string {
  const end = new Date();
  end.setHours(end.getHours() + 8, 0, 0, 0);
  return end.toISOString();
}

export default function HomePage() {
  const flashSaleEndsAt = getFlashSaleEnd();

  return (
    <div className="flex min-h-full flex-col pb-16 md:pb-0">
      <AnnouncementBar />
      <SiteHeader />

      <main>
        <HeroSlider slides={heroSlides} />
        <FeatureStrip />
        <MarketplaceQuickLinks />

        <CategorySection
          title="Featured Categories"
          subtitle="Browse by department"
          categories={featuredCategories}
        />

        <CategorySection
          title="Shop by Category"
          categories={categories}
          variant="grid"
        />

        <FlashSaleSection
          products={flashSaleProducts}
          endsAt={flashSaleEndsAt}
        />

        <ProductSection
          title="Featured Products"
          subtitle="Hand-picked by our team"
          products={featuredProducts}
        />

        <ProductSection
          title="Trending Now"
          subtitle="Popular this week"
          products={trendingProducts}
          href="/shop?sort=trending"
        />

        <ProductSection
          title="Best Sellers"
          products={bestSellers}
          href="/shop?sort=bestsellers"
        />

        <ProductSection
          title="New Arrivals"
          subtitle="Fresh listings from vendors"
          products={newArrivals}
          href="/shop?sort=new"
        />

        <ProductSection
          title="Top Rated"
          subtitle="Highest rated by customers"
          products={topRated}
          href="/shop?sort=rating"
        />

        <ProductSection
          title="Recommended for You"
          subtitle="Based on trending purchases"
          products={recommendedProducts}
          href="/shop?sort=recommended"
        />

        <VendorsSection vendors={featuredVendors} />

        <BrandsSection brands={popularBrands} />

        <ReviewsSection reviews={customerReviews} />

        <VideoReviewsSection videos={videoReviews} />

        <InstagramSection posts={instagramPosts} />

        <BlogSection posts={blogPosts} />

        <NewsletterSection />

        <TrustBadges />
      </main>

      <SiteFooter />
    </div>
  );
}

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};
