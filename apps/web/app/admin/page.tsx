import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Admin dashboard" };

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/admin");

  const roles = user.roles ?? [];
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Marketplace owner dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Manage vendors, monitor sales, and review marketplace analytics from this owner console.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <a href="/admin/vendors" className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/60 hover:shadow-sm">
            <h2 className="font-semibold text-primary">Vendors</h2>
            <p className="mt-2 text-sm text-muted">Approve and manage vendor stores.</p>
          </a>
          <a href="/admin/orders" className="rounded-xl border border-border bg-surface p-6 transition hover:border-accent/60 hover:shadow-sm">
            <h2 className="font-semibold text-primary">Orders</h2>
            <p className="mt-2 text-sm text-muted">Track platform-wide orders and fulfillment.</p>
          </a>
          <div className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-primary">Analytics</h2>
            <p className="mt-2 text-sm text-muted">Monitor traffic, conversion, and vendor performance.</p>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
