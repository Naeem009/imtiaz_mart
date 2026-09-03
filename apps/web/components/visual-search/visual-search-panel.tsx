"use client";

import Image from "next/image";
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
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function performSearch(imgUrl?: string, text?: string) {
    const trimmedQuery = (text ?? query).trim();
    const trimmedImageUrl = (imgUrl ?? imageUrl).trim();

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performSearch();
  }

  async function uploadFile(file: File | null) {
    if (!file) return null;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file, file.name);

      const res = await fetch(`${siteConfig.apiUrl}/uploads`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }

      const json = await res.json();
      if (json?.url) {
        setImageUrl(json.url);
        setPreviewUrl(json.url);
        // auto-run search with the uploaded url
        await performSearch(json.url, query);
        return json.url;
      }

      throw new Error("Upload returned no URL");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading(false);
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
              <span className="text-sm font-medium text-primary">Or upload an image</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.currentTarget.files?.[0] ?? null;
                  if (!f) return;
                  await uploadFile(f);
                }}
                className="mt-2 w-full text-sm"
              />
              {uploading ? <p className="mt-2 text-sm text-muted">Uploading...</p> : null}
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

          {previewUrl ? (
            <div className="mt-4">
              <p className="text-sm text-muted mb-2">Preview</p>
              <div className="max-w-xs overflow-hidden rounded-lg">
                <Image
                  src={previewUrl}
                  alt="upload preview"
                  width={320}
                  height={240}
                  unoptimized
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  className="rounded-full px-3 py-1 text-sm bg-surface text-muted hover:bg-background"
                  onClick={() => {
                    setPreviewUrl(null);
                    setImageUrl("");
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}

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
