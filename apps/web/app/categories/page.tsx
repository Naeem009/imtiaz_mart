import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchCategories } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Categories</h1>
        <p className="mt-2 text-muted">Browse by department</p>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-md"
            >
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-primary/40 ${cat.imageUrl ?? "bg-slate-100"}`}
              >
                {cat.name.charAt(0)}
              </div>
              <h2 className="mt-4 font-semibold text-primary group-hover:text-accent">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {cat.productCount} products
              </p>
            </Link>
          ))}
        </div>
      </div>
    </ShopShell>
  );
}
