import Link from "next/link";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchProducts } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Deals",
  description: "Browse limited-time discounts and special offers on Imtiaz Mart",
};

export default async function DealsPage() {
  const result = await fetchProducts({ page: 1, limit: 24, sort: "newest" });
  const dealProducts = result.data.filter(
    (product) =>
      product.compareAtPrice !== null &&
      product.compareAtPrice > product.price,
  );

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Limited-time deals
          </p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Save more with curated offers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Discover discounted essentials, seasonal favorites, and high-demand picks from trusted vendors.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Browse all products
            </Link>
            <Link href="/vendors" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-primary hover:bg-background">
              Explore vendor stores
            </Link>
          </div>
        </div>

        <div className="mt-8">
          {dealProducts.length > 0 ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary">Featured offers</h2>
                <p className="text-sm text-muted">{dealProducts.length} deals available</p>
              </div>
              <ProductGrid products={dealProducts} emptyMessage="No deals available right now." />
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center text-muted">
              No deal products are available right now. Please check back soon.
            </div>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
