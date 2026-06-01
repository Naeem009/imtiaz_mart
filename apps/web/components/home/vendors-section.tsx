import Link from "next/link";
import type { HomeVendor } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface VendorsSectionProps {
  vendors: HomeVendor[];
}

export function VendorsSection({ vendors }: VendorsSectionProps) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Vendors"
          subtitle="Shop from our top-rated sellers"
          href="/vendors"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-surface p-6 text-center transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-primary/50 ${vendor.image} group-hover:scale-105 transition-transform`}
              >
                {vendor.name.charAt(0)}
              </div>
              <h3 className="mt-4 font-semibold text-primary group-hover:text-accent">
                {vendor.name}
              </h3>
              <p className="mt-1 text-sm text-muted">
                ★ {vendor.rating} · {vendor.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
