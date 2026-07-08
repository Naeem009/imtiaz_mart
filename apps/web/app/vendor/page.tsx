import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor");

  const roles = user.roles ?? [];
  const isVendor = roles.includes("vendor") || roles.includes("vendor_staff");
  if (!isVendor) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Vendor dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Manage your product catalog, review orders, and track performance from one place.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a href="/vendor/products" className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/60 hover:shadow-sm">
            <h2 className="font-semibold text-primary">Products</h2>
            <p className="mt-2 text-sm text-muted">Add, update, and archive your inventory.</p>
          </a>
          <a href="/vendor/orders" className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/60 hover:shadow-sm">
            <h2 className="font-semibold text-primary">Orders</h2>
            <p className="mt-2 text-sm text-muted">View orders containing your items.</p>
          </a>
          <a href="/vendor/analytics" className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/60 hover:shadow-sm">
            <h2 className="font-semibold text-primary">Performance</h2>
            <p className="mt-2 text-sm text-muted">Review sales and store analytics.</p>
          </a>
        </div>
      </div>
    </ShopShell>
  );
}
