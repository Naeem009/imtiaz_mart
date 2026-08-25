import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/product/add-to-cart-panel";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductReviews } from "@/components/product/product-reviews";
import { WishlistButton } from "@/components/product/wishlist-button";
import { ProductGrid } from "@/components/shop/product-grid";
import { ShopShell } from "@/components/layout/shop-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { fetchProduct, fetchRecommended } from "@/lib/catalog/fetch";
import { fetchProductReviews } from "@/lib/commerce/api";
import { getSession } from "@/lib/auth/session";
import { getCompareIds } from "@/lib/compare/cookie";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl, httpUrls } from "@/lib/seo/urls";
import { CompareToggle } from "@/components/product/compare-toggle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  const images = httpUrls(product?.images.map((image) => image.url) ?? []);
  return {
    title: product?.name ?? "Product",
    description: product?.shortDescription ?? undefined,
    alternates: { canonical: `/products/${slug}` },
    openGraph: product
      ? {
          type: "website",
          title: product.name,
          description: product.shortDescription ?? undefined,
          url: absoluteUrl(`/products/${slug}`),
          images: images.length > 0 ? images : undefined,
        }
      : undefined,
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const [related, reviews, user, compareIds] = await Promise.all([
    fetchRecommended(),
    fetchProductReviews(slug),
    getSession(),
    getCompareIds(),
  ]);

  return (
    <ShopShell>
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: product.category.name, path: `/categories/${product.category.slug}` },
          { name: product.name },
        ])}
      />
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
              <WishlistButton productId={product.id} slug={product.slug} />
              <CompareToggle
                productId={product.id}
                selected={compareIds.includes(product.id)}
              />
            </div>
          </div>
        </div>

        <section className="mt-16 border-t border-border pt-12">
          <h2 className="text-xl font-bold text-primary">Description</h2>
          <p className="mt-4 leading-relaxed text-muted">
            {product.description}
          </p>
        </section>

        <ProductReviews
          slug={slug}
          productId={product.id}
          reviews={reviews}
          canWrite={Boolean(user)}
          error={error}
        />

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
