import type { ProductListItem } from "@imtiaz-mart/shared";
import { ProductCard } from "@/components/ui/product-card";

interface ProductGridProps {
  products: ProductListItem[];
  emptyMessage?: string;
}

export function ProductGrid({
  products,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (!products.length) {
    return (
      <p className="py-16 text-center text-muted">{emptyMessage}</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
