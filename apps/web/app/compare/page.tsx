import Link from "next/link";
import type { Metadata } from "next";
import type { ProductDetail } from "@imtiaz-mart/shared";
import { ShopShell } from "@/components/layout/shop-shell";
import { JsonLd } from "@/components/seo/json-ld";
import { addToCartAction } from "@/lib/cart/actions";
import { fetchCompareProducts } from "@/lib/catalog/fetch";
import { clearCompareAction, removeCompareAction } from "@/lib/compare/actions";
import { getCompareIds } from "@/lib/compare/cookie";
import { itemListJsonLd } from "@/lib/seo/json-ld";
import { formatPrice } from "@/lib/utils/currency";

export const metadata: Metadata = {
  title: "Compare products",
  alternates: { canonical: "/compare" },
};

function stockLabel(product: ProductDetail) {
  const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  if (product.variants.length === 0) return "Available";
  return stock > 0 ? `In stock (${stock})` : "Out of stock";
}

const ROWS: Array<{
  label: string;
  value: (product: ProductDetail) => string;
}> = [
  { label: "Price", value: (product) => formatPrice(product.price) },
  {
    label: "Was",
    value: (product) =>
      product.compareAtPrice ? formatPrice(product.compareAtPrice) : "—",
  },
  { label: "Rating", value: (product) => `${product.rating} (${product.reviewCount})` },
  { label: "Brand", value: (product) => product.brand?.name ?? "—" },
  { label: "Category", value: (product) => product.category.name },
  { label: "Vendor", value: (product) => product.vendor.name },
  { label: "SKU", value: (product) => product.sku ?? "—" },
  { label: "Availability", value: stockLabel },
];

export default async function ComparePage() {
  const ids = await getCompareIds();
  const products = await fetchCompareProducts(ids);

  return (
    <ShopShell>
      {products.length > 0 ? (
        <JsonLd data={itemListJsonLd("Compare products", "/compare", products)} />
      ) : null}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Compare products</h1>
            <p className="mt-2 text-muted">
              Add up to 4 products from the shop, then review price, brand, and availability side by side.
            </p>
          </div>
          {products.length > 0 ? (
            <form action={clearCompareAction}>
              <button type="submit" className="text-sm text-muted hover:text-text">
                Clear all
              </button>
            </form>
          ) : null}
        </div>

        {products.length === 0 ? (
          <p className="mt-10 rounded-xl border border-border bg-surface px-6 py-10 text-center text-muted">
            No products selected.{" "}
            <Link href="/shop" className="font-medium text-accent hover:underline">
              Browse the shop
            </Link>{" "}
            and tap Compare.
          </p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-36 min-w-32 border-b border-border p-3 text-left font-medium text-muted">
                    Feature
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="min-w-[14rem] border-b border-border p-3 text-left align-top">
                      <Link href={`/products/${product.slug}`} className="font-semibold text-primary hover:text-accent">
                        {product.name}
                      </Link>
                      <form action={removeCompareAction} className="mt-2">
                        <input type="hidden" name="productId" value={product.id} />
                        <button type="submit" className="text-xs text-muted hover:text-error">
                          Remove
                        </button>
                      </form>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="odd:bg-surface">
                    <th className="border-b border-border p-3 text-left font-medium text-muted">
                      {row.label}
                    </th>
                    {products.map((product) => (
                      <td key={product.id} className="border-b border-border p-3 text-primary">
                        {row.value(product)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th className="p-3 text-left font-medium text-muted">Summary</th>
                  {products.map((product) => (
                    <td key={product.id} className="p-3 text-muted">
                      {product.shortDescription ?? "—"}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="p-3" />
                  {products.map((product) => {
                    const variantId = product.variants[0]?.id;
                    const inStock =
                      product.variants.length === 0 ||
                      product.variants.some((variant) => variant.stock > 0);
                    return (
                      <td key={product.id} className="p-3">
                        {variantId && inStock ? (
                          <form action={addToCartAction}>
                            <input type="hidden" name="variantId" value={variantId} />
                            <input type="hidden" name="quantity" value="1" />
                            <input type="hidden" name="redirectTo" value="/compare" />
                            <button
                              type="submit"
                              className="rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                              Add to cart
                            </button>
                          </form>
                        ) : (
                          <Link
                            href={`/products/${product.slug}`}
                            className="text-sm font-medium text-accent hover:underline"
                          >
                            View product
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
