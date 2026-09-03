import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { EditProductForm } from "@/components/vendor/edit-product-form";
import { getCategories } from "@/lib/api/catalog";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorProducts } from "@/lib/vendor/api";

export const metadata = { title: "Edit vendor product" };

export default async function EditVendorProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(VENDOR_ROLES, "/vendor/products");
  const [{ id }, { error }, products, categories] = await Promise.all([
    params,
    searchParams,
    fetchVendorProducts(),
    getCategories(),
  ]);
  const product = products?.find((item) => item.id === id);

  if (!product) notFound();

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Edit product</h1>
          <PortalNav current="/vendor/products" links={vendorNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <EditProductForm product={product} categories={categories ?? []} />
          <Link
            href="/vendor/products"
            className="mt-4 block text-center text-sm font-medium text-accent hover:underline"
          >
            Back to products
          </Link>
        </div>
      </div>
    </ShopShell>
  );
}
