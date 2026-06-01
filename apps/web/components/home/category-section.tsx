import Link from "next/link";
import type { HomeCategory } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  categories: HomeCategory[];
  href?: string;
  variant?: "featured" | "grid";
}

export function CategorySection({
  title,
  subtitle,
  categories,
  href = "/categories",
  variant = "featured",
}: CategorySectionProps) {
  return (
    <section className="py-10 sm:py-14" aria-labelledby={`${title.replace(/\s/g, "-")}-heading`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} subtitle={subtitle} href={href} />
        <div
          className={
            variant === "featured"
              ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
              : "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
          }
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-primary/60 ${cat.image} transition-transform group-hover:scale-105 sm:h-20 sm:w-20`}
              >
                {cat.name.charAt(0)}
              </div>
              <span className="mt-3 text-center text-sm font-medium text-primary group-hover:text-accent">
                {cat.name}
              </span>
              <span className="mt-0.5 text-xs text-muted">
                {cat.productCount.toLocaleString()} items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
