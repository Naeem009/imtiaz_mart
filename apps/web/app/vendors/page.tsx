import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchPublicVendors } from "@/lib/vendor/api";

export const metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const vendors = await fetchPublicVendors();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Vendors
              </p>
              <h1 className="mt-2 text-3xl font-bold text-primary">Discover trusted sellers</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
                Browse featured vendors, explore their stores, and shop from verified sellers across the marketplace.
              </p>
            </div>
            <Link href="/vendor/register" className="inline-flex rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Become a seller
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendors.length === 0 ? (
            <p className="text-sm text-muted">No vendor stores are public yet.</p>
          ) : (
            vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="group rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-background text-xl font-bold text-primary/50">
                  {vendor.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vendor.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    vendor.name.charAt(0)
                  )}
                </div>
                <h2 className="mt-4 text-lg font-semibold text-primary group-hover:text-accent">
                  {vendor.name}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  ★ {vendor.rating.toFixed(1)} · {vendor.productCount} products
                  {vendor.isVerified ? " · Verified" : ""}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
