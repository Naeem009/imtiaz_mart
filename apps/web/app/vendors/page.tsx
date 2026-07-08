import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { featuredVendors } from "@/lib/data/homepage";

export const metadata = { title: "Vendors" };

export default function VendorsPage() {
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
          {featuredVendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-primary/50 ${vendor.image}`}>
                {vendor.name.charAt(0)}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-primary group-hover:text-accent">
                {vendor.name}
              </h2>
              <p className="mt-2 text-sm text-muted">
                ★ {vendor.rating} · {vendor.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}
