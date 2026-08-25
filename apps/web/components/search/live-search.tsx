"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductThumb } from "@/components/search/product-thumb";
import { useDebouncedProductSearch } from "@/lib/catalog/use-debounced-product-search";
import { formatPrice } from "@/lib/utils/currency";

export function LiveSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const { items, total, loading } = useDebouncedProductSearch(query, 20);

  useEffect(() => {
    const next = query.trim();
    const url = next ? `/search?q=${encodeURIComponent(next)}` : "/search";
    window.history.replaceState(null, "", url);
  }, [query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <h1 className="text-3xl font-bold text-primary">Search</h1>
      <p className="mt-2 text-muted">Products appear as you type.</p>

      <div className="mt-6 max-w-xl">
        <label htmlFor="live-search" className="sr-only">
          Search products
        </label>
        <input
          id="live-search"
          type="search"
          value={query}
          autoComplete="off"
          autoFocus
          placeholder="Type a product name…"
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="mt-8">
        {!query.trim() ? (
          <p className="text-muted">Start typing to see matching products.</p>
        ) : loading && items.length === 0 ? (
          <p className="text-muted">Searching…</p>
        ) : items.length === 0 ? (
          <p className="text-muted">No results for “{query.trim()}”.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">
              {total} result{total === 1 ? "" : "s"}
            </p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-accent/50"
                  >
                    <ProductThumb product={product} className="h-16 w-16 rounded-lg" />
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-muted">{product.vendor.name}</span>
                      <span className="mt-0.5 block truncate font-medium text-primary">
                        {product.name}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
