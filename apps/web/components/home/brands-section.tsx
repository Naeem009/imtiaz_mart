import Link from "next/link";
import type { HomeBrand } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface BrandsSectionProps {
  brands: HomeBrand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="border-y border-border bg-surface py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Popular Brands" href="/brands" />
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex h-14 min-w-[100px] items-center justify-center rounded-lg border border-border bg-background px-6 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
