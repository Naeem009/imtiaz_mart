import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { CreateProductForm } from "@/components/vendor/create-product-form";
import { getCategories } from "@/lib/api/catalog";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { archiveVendorProductAction } from "@/lib/vendor/actions";
import { fetchVendorProducts } from "@/lib/vendor/api";
import { formatPrice } from "@/lib/utils/currency";
import Link from "next/link";

export const metadata = { title: "Vendor products" };

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(VENDOR_ROLES, "/vendor/products");
  const { error } = await searchParams;
  const [products, categories] = await Promise.all([
    fetchVendorProducts(),
    getCategories(),
  ]);

  const list = products ?? [];
  const active = list.filter((product) => product.status === "ACTIVE").length;
  const outOfStock = list.filter((product) => product.stock <= 0).length;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Products</h1>
          <PortalNav current="/vendor/products" links={vendorNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric label="Catalog size" value={list.length} />
          <Metric label="Active products" value={active} />
          <Metric label="Out of stock" value={outOfStock} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-3">
            {list.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
                No products yet. Create your first listing to start selling.
              </div>
            ) : (
              list.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-primary">{product.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      {product.categoryName} · {formatPrice(product.price)} · {product.stock} in stock · {product.status}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background"
                    >
                      Edit
                    </Link>
                    <form action={archiveVendorProductAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background"
                      >
                        Archive
                      </button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary">Add a product</h2>
            <div className="mt-5">
              <CreateProductForm categories={categories ?? []} />
            </div>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}
