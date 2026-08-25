import type { ProductListItem } from "@imtiaz-mart/shared";

export function ProductThumb({
  product,
  className = "h-10 w-10",
}: {
  product: Pick<ProductListItem, "name" | "primaryImage">;
  className?: string;
}) {
  const url = product.primaryImage;
  const isCss = Boolean(url?.startsWith("bg-"));

  return (
    <div
      className={`shrink-0 overflow-hidden rounded-md ${isCss ? url : "bg-slate-100"} ${className}`}
      style={
        url && !isCss
          ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
      role="img"
      aria-label={product.name}
    />
  );
}
