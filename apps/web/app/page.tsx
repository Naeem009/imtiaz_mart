import { AnnouncementBar } from "@/components/home/announcement-bar";
import { BlogSection } from "@/components/home/blog-section";
import { BrandsSection } from "@/components/home/brands-section";
import { CategorySection } from "@/components/home/category-section";
import { FeatureStrip } from "@/components/home/feature-strip";
import { FlashSaleSection } from "@/components/home/flash-sale-section";
import { HeroSlider } from "@/components/home/hero-slider";
import { MarketplaceQuickLinks } from "@/components/home/marketplace-quick-links";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ProductSection } from "@/components/home/product-section";
import { ReviewsSection } from "@/components/home/reviews-section";
import { TrustBadges } from "@/components/home/trust-badges";
import { VendorsSection } from "@/components/home/vendors-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CompareBar } from "@/components/product/compare-bar";
import { siteConfig } from "@/config/site";
import { loadHomePage } from "@/lib/home/load-home";
import { getCompareIds } from "@/lib/compare/cookie";

export const revalidate = 60;

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ newsletter?: string }>;
}) {
  const home = await loadHomePage();
  const { newsletter } = await searchParams;
  const compareCount = (await getCompareIds()).length;

  return (
    <div
      className={`flex min-h-full flex-col ${compareCount > 0 ? "pb-36 md:pb-24" : "pb-16 md:pb-0"}`}
    >
      <AnnouncementBar text={home.announcement.text} href={home.announcement.href} />
      <SiteHeader />

      <main>
        <HeroSlider slides={home.slides} />
        <FeatureStrip />
        <MarketplaceQuickLinks />

        <CategorySection
          title="Featured Categories"
          subtitle="Browse by department"
          categories={home.featuredCategories}
        />

        <CategorySection
          title="Shop by Category"
          categories={home.categories}
          variant="grid"
        />

        <FlashSaleSection products={home.flashSale} endsAt={home.flashSaleEndsAt} />

        <ProductSection
          title="Featured Products"
          subtitle="Hand-picked by our team"
          products={home.featured}
        />

        <ProductSection
          title="Trending Now"
          subtitle="Popular this week"
          products={home.trending}
          href="/shop?sort=trending"
        />

        <ProductSection
          title="Best Sellers"
          products={home.bestsellers}
          href="/shop?sort=bestseller"
        />

        <ProductSection
          title="New Arrivals"
          subtitle="Fresh listings from vendors"
          products={home.newArrivals}
          href="/shop?sort=newest"
        />

        <ProductSection
          title="Top Rated"
          subtitle="Highest rated by customers"
          products={home.topRated}
          href="/shop?sort=rating"
        />

        <ProductSection
          title="Recommended for You"
          subtitle="Based on trending purchases"
          products={home.recommended}
        />

        <VendorsSection vendors={home.vendors} />

        <BrandsSection brands={home.brands} />

        <ReviewsSection reviews={home.reviews} />

        <BlogSection posts={home.posts} />

        <NewsletterSection status={newsletter} />

        <TrustBadges />
      </main>

      <SiteFooter />
      <CompareBar />
    </div>
  );
}
