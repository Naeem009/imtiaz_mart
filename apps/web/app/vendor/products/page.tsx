import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Vendor products" };

export default async function VendorProductsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor/products");

  const roles = user.roles ?? [];
  const isVendor = roles.includes("vendor") || roles.includes("vendor_staff");
  if (!isVendor) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Products</h1>
          </div>
          <Link href="/vendor" className="text-sm font-medium text-accent hover:opacity-80">
            ← Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary">Inventory overview</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              This view is ready for product CRUD, stock levels, pricing, and media management.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted">Active products</p>
                <p className="mt-2 text-2xl font-semibold text-primary">24</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted">Out of stock</p>
                <p className="mt-2 text-2xl font-semibold text-primary">3</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm text-muted">Pending approval</p>
                <p className="mt-2 text-2xl font-semibold text-primary">2</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-primary">Quick actions</h2>
            <div className="mt-5 space-y-3">
              <Link href="/vendor/products" className="block rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-muted/40">
                Manage products
              </Link>
              <Link href="/vendor/orders" className="block rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-muted/40">
                Review orders
              </Link>
              <Link href="/vendor/analytics" className="block rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-primary hover:bg-muted/40">
                Open analytics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
