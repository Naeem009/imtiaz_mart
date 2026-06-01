import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchProduct, fetchRecommended } from "@/lib/catalog/fetch";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.shortDescription ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const related = await fetchRecommended();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav className="mb-6 text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-text">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-text">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <Link
            href={`/categories/${product.category.slug}`}
            className="hover:text-text"
          >
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            {product.badge && (
              <span className="inline-block rounded-md bg-cta/10 px-2 py-1 text-xs font-semibold text-cta">
                {product.badge}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted">
              <span className="text-warning">★ {product.rating}</span>
              <span>({product.reviewCount} reviews)</span>
            </div>
            <p className="mt-4 text-muted">{product.shortDescription}</p>

            <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-primary/50 ${product.vendor.name.charAt(0) ? "bg-slate-200" : ""}`}
              >
                {product.vendor.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm text-muted">Sold by</p>
                <Link
                  href={`/vendors/${product.vendor.slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {product.vendor.name}
                </Link>
                <p className="text-xs text-muted">
                  ★ {product.vendor.rating} vendor rating
                </p>
              </div>
            </div>

            <div className="mt-8">
              <AddToCartPanel product={product} />
            </div>

            <div className="mt-6 flex gap-4 text-sm">
              <button type="button" className="text-muted hover:text-accent">
                ♡ Wishlist
              </button>
              <button type="button" className="text-muted hover:text-accent">
                ⇄ Compare
              </button>
              <button type="button" className="text-muted hover:text-accent">
                Share
              </button>
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-bold text-primary">Description</h2>
          <p className="mt-4 leading-relaxed text-muted">
            {product.description}
          </p>
        </section>

        <section className="mt-12 rounded-xl border border-border bg-surface p-8 text-center">
          <h2 className="text-lg font-semibold text-primary">
            Reviews & Q&A
          </h2>
          <p className="mt-2 text-sm text-muted">
            Customer reviews and questions will appear here once the engagement
            module is connected.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold text-primary">
            Related products
          </h2>
          <ProductGrid
            products={related.filter((p) => p.slug !== slug).slice(0, 4)}
          />
        </section>
      </div>

    </ShopShell>
  );
}
