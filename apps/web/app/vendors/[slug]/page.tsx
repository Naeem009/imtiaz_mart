import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { ProductGrid } from "@/components/shop/product-grid";
import { fetchVendorStore } from "@/lib/vendor/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await fetchVendorStore(slug);
  return {
    title: vendor?.name ?? "Vendor store",
    description: vendor?.description ?? undefined,
  };
}

export default async function VendorStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vendor = await fetchVendorStore(slug);
  if (!vendor) notFound();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Vendor store
              </p>
              <h1 className="mt-2 text-3xl font-bold text-primary">{vendor.name}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                {vendor.description ?? "This vendor store is ready for products and orders."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted">
              <div className="font-medium text-primary">{vendor.productCount} products</div>
              <div className="mt-1">★ {vendor.rating.toFixed(1)} rating</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary">Featured products</h2>
            <Link href="/shop" className="text-sm font-medium text-accent hover:underline">
              Browse all
            </Link>
          </div>
          <ProductGrid products={vendor.products ?? []} />
        </div>
      </div>
    </ShopShell>
  );
}
