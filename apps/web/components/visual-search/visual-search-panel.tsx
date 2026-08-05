"use client";

import { FormEvent, useState } from "react";
import type { PaginatedProducts, ProductListItem } from "@imtiaz-mart/shared";
import { ProductGrid } from "@/components/shop/product-grid";
import { siteConfig } from "@/config/site";

const emptyMeta = { page: 1, limit: 0, total: 0, totalPages: 1 };

export function VisualSearchPanel() {
  const [query, setQuery] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedProducts["meta"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedQuery && !trimmedImageUrl) {
      setError("Enter an image URL or text hint to search.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${siteConfig.apiUrl}/products/visual-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: trimmedQuery || undefined,
          imageUrl: trimmedImageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to perform visual search.");
      }

      const json = await response.json();
      const data = Array.isArray(json)
        ? (json as ProductListItem[])
        : (json.data as ProductListItem[] | undefined) ?? [];
      const meta = Array.isArray(json)
        ? {
            page: 1,
            limit: data.length,
            total: data.length,
            totalPages: 1,
          }
        : (json.meta as PaginatedProducts["meta"] | undefined) ?? emptyMeta;

      setResults(data);
      setMeta(meta);
      setHasSearched(true);
    } catch (error: unknown) {
      setResults([]);
      setMeta(null);
      setHasSearched(true);
      setError(error instanceof Error ? error.message : "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Visual Search</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Paste an image URL or enter a search hint to find visually related products.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-primary">Image URL</span>
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-primary">Text hint</span>
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for red sneakers, leather bag, floral dress..."
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </label>
          </div>

          {error ? (
            <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              Tip: use a public image URL for the most accurate results.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-cta px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>
      </section>

      {hasSearched ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">
              {meta ? `${meta.total} ${meta.total === 1 ? "product" : "products"} found` : "No results returned."}
            </p>
          </div>
          <ProductGrid products={results} emptyMessage="No matching products found." />
        </section>
      ) : null}
    </div>
  );
}
