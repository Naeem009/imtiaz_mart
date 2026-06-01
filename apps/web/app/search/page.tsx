import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchSearchProducts } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort ?? "newest";

  const result = q
    ? await fetchSearchProducts({ q, page, limit: 20, sort })
    : { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1 } };

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Search</h1>
        {!q ? (
          <p className="mt-4 text-muted">
            Enter a search term in the header to find products.
          </p>
        ) : (
          <>
            <ShopToolbar
              total={result.meta.total}
              currentSort={sort}
              basePath="/search"
              searchQuery={q}
            />
            <ProductGrid
              products={result.data}
              emptyMessage={`No results for "${q}"`}
            />
            <Pagination
              page={result.meta.page}
              totalPages={result.meta.totalPages}
              basePath="/search"
              query={{ q, sort: sort !== "newest" ? sort : undefined }}
            />
          </>
        )}
      </div>
    </ShopShell>
  );
}
