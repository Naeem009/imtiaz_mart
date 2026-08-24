import Link from "next/link";
import type { PublicVendorDto } from "@imtiaz-mart/shared";
import { SectionHeader } from "@/components/ui/section-header";
import { isHttpUrl, surfaceFromSlug } from "@/lib/home/palette";

interface VendorsSectionProps {
  vendors: PublicVendorDto[];
}

export function VendorsSection({ vendors }: VendorsSectionProps) {
  if (vendors.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Vendors"
          subtitle="Shop from our top-rated sellers"
          href="/vendors"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {vendors.map((vendor) => {
            const logo = vendor.logoUrl?.trim() ?? "";
            const remote = isHttpUrl(logo);

            return (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.slug}`}
                className="group flex flex-col items-center rounded-xl border border-border bg-surface p-6 text-center transition-shadow hover:shadow-md"
              >
                <div
                  className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-primary/50 transition-transform group-hover:scale-105 ${remote ? "bg-slate-100" : surfaceFromSlug(vendor.slug)}`}
                  style={
                    remote
                      ? {
                          backgroundImage: `url(${logo})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {remote ? null : vendor.name.charAt(0)}
                </div>
                <h3 className="mt-4 font-semibold text-primary group-hover:text-accent">
                  {vendor.name}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  ★ {vendor.rating.toFixed(1)} · {vendor.productCount} products
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
