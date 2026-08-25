"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ProductThumb } from "@/components/search/product-thumb";
import { useDebouncedProductSearch } from "@/lib/catalog/use-debounced-product-search";
import { formatPrice } from "@/lib/utils/currency";

export function SearchBox({
  initialQuery = "",
  autoFocus = false,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { items, total, loading } = useDebouncedProductSearch(query, 8);
  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [items]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function goToProduct(slug: string) {
    setOpen(false);
    router.push(`/products/${slug}`);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showPanel) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && activeIndex >= 0 && items[activeIndex]) {
      event.preventDefault();
      goToProduct(items[activeIndex].slug);
    }
  }

  return (
    <div ref={rootRef} className="relative w-full">
      <form action="/search" method="get" role="search">
        <label htmlFor="header-search" className="sr-only">
          Search products
        </label>
        <input
          id="header-search"
          name="q"
          type="search"
          value={query}
          autoFocus={autoFocus}
          autoComplete="off"
          placeholder="Search products, brands, vendors..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </form>

      {showPanel ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] z-50 w-full overflow-hidden rounded-xl border border-border bg-background shadow-lg"
        >
          {loading && items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">Searching…</p>
          ) : items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">No products match “{query.trim()}”.</p>
          ) : (
            <ul>
              {items.map((product, index) => (
                <li key={product.id} role="option" aria-selected={index === activeIndex}>
                  <Link
                    href={`/products/${product.slug}`}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-surface ${
                      index === activeIndex ? "bg-surface" : ""
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <ProductThumb product={product} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-primary">{product.name}</span>
                      <span className="block truncate text-xs text-muted">{product.vendor.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="block border-t border-border px-4 py-2.5 text-sm font-medium text-accent hover:bg-surface"
            onClick={() => setOpen(false)}
          >
            {total > items.length
              ? `See all ${total} results for “${query.trim()}”`
              : `Search “${query.trim()}”`}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
