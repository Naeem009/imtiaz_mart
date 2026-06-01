import Link from "next/link";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "bestseller", label: "Best sellers" },
  { value: "rating", label: "Top rated" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
];

interface ShopToolbarProps {
  total: number;
  currentSort: string;
  basePath: string;
  searchQuery?: string;
}

export function ShopToolbar({
  total,
  currentSort,
  basePath,
  searchQuery,
}: ShopToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        {total} {total === 1 ? "product" : "products"}
        {searchQuery ? (
          <>
            {" "}
            for &ldquo;<span className="font-medium text-text">{searchQuery}</span>&rdquo;
          </>
        ) : null}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Sort:</span>
        {SORT_OPTIONS.map((opt) => {
          const params = new URLSearchParams();
          if (searchQuery) params.set("q", searchQuery);
          if (opt.value !== "newest") params.set("sort", opt.value);
          const href = params.toString()
            ? `${basePath}?${params}`
            : basePath;
          const active = currentSort === opt.value || (opt.value === "newest" && !currentSort);

          return (
            <Link
              key={opt.value}
              href={href}
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:text-text"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
