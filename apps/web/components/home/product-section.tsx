import type { ProductListItem } from "@imtiaz-mart/shared";
import { ProductCard } from "@/components/ui/product-card";
import { SectionHeader } from "@/components/ui/section-header";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: ProductListItem[];
  href?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  href = "/shop",
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader title={title} subtitle={subtitle} href={href} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
