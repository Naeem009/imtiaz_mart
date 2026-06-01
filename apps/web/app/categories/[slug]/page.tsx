import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/shop/product-grid";
import { Pagination } from "@/components/shop/pagination";
import { ShopToolbar } from "@/components/shop/shop-toolbar";
import { ShopShell } from "@/components/layout/shop-shell";
import { getCategory } from "@/lib/api/catalog";
import { fetchCategoryProducts } from "@/lib/catalog/fetch";
import { getMockCategories } from "@/lib/catalog/fallback";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat =
    (await getCategory(slug)) ??
    getMockCategories().find((c) => c.slug === slug);
  return { title: cat?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const sort = sp.sort ?? "newest";

  const category =
    (await getCategory(slug)) ??
    getMockCategories().find((c) => c.slug === slug);

  if (!category) notFound();

  const result = await fetchCategoryProducts(slug, { page, limit: 20, sort });

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">{category.name}</h1>
        <p className="mt-2 text-muted">
          {category.productCount} products in this category
        </p>
        <ShopToolbar
          total={result.meta.total}
          currentSort={sort}
          basePath={`/categories/${slug}`}
        />
        <ProductGrid products={result.data} />
        <Pagination
          page={result.meta.page}
          totalPages={result.meta.totalPages}
          basePath={`/categories/${slug}`}
          query={{ sort: sort !== "newest" ? sort : undefined }}
        />
      </div>
    </ShopShell>
  );
}
