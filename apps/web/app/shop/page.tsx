import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchCategories, fetchProducts } from "@/lib/catalog/fetch";
import Link from "next/link";

export const metadata = {
  title: "Shop",
  description: "Browse all products on Imtiaz Mart",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; category?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const sort = params.sort ?? "newest";

  const [result, categories] = await Promise.all([
    fetchProducts({
      page,
      limit: 20,
      sort,
      category: params.category,
      brand: params.brand,
    }),
    fetchCategories(),
  ]);

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Shop</h1>
        <p className="mt-2 text-muted">Discover products from verified vendors</p>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-56 shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
              Categories
            </h2>
            <ul className="mt-4 space-y-1">
              <li>
                <Link
                  href="/shop"
                  className={`block rounded-lg px-3 py-2 text-sm ${!params.category ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-surface"}`}
                >
                  All products
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm ${params.category === cat.slug ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-surface"}`}
                  >
                    {cat.name}
                    <span className="ml-1 text-xs">({cat.productCount})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="min-w-0 flex-1">
            <ShopToolbar
              total={result.meta.total}
              currentSort={sort}
              basePath="/shop"
            />
            <ProductGrid products={result.data} />
            <Pagination
              page={result.meta.page}
              totalPages={result.meta.totalPages}
              basePath="/shop"
              query={{ sort: sort !== "newest" ? sort : undefined, category: params.category, brand: params.brand }}
            />
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
