import Link from "next/link";
import type { ProductListItem } from "@imtiaz-mart/shared";
import { formatPrice } from "@/lib/utils/currency";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : null;

  const imageClass = product.primaryImage ?? "bg-slate-200";

  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div
          className={`relative aspect-square overflow-hidden rounded-xl ${imageClass.startsWith("bg-") ? imageClass : ""} transition-transform group-hover:scale-[1.02]`}
          style={
            !imageClass.startsWith("bg-")
              ? { backgroundImage: `url(${imageClass})`, backgroundSize: "cover" }
              : undefined
          }
        >
          {product.badge && (
            <span className="absolute left-2 top-2 rounded-md bg-cta px-2 py-0.5 text-xs font-semibold text-white">
              {product.badge}
            </span>
          )}
          {discount && (
            <span className="absolute right-2 top-2 rounded-md bg-error px-2 py-0.5 text-xs font-semibold text-white">
              -{discount}%
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-1">
          <p className="text-xs text-muted">{product.vendor.name}</p>
          <h3 className="line-clamp-2 text-sm font-medium text-primary group-hover:text-accent">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-warning" aria-hidden>
              ★
            </span>
            <span className="text-xs text-muted">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
