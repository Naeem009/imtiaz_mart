import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchBrands } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Brands",
};

export default async function BrandsPage() {
  const brands = await fetchBrands();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Popular Brands</h1>
        <p className="mt-2 text-muted">Shop by your favorite brands</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-6 py-5 transition-shadow hover:shadow-md"
            >
              <span className="text-lg font-semibold text-primary">
                {brand.name}
              </span>
              <span className="text-sm text-muted">
                {brand.productCount} products
              </span>
            </Link>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}
