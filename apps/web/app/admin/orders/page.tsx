import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Admin orders" };

export default async function AdminOrdersPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/admin/orders");

  const roles = user.roles ?? [];
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Orders</h1>
          </div>
          <Link href="/admin" className="text-sm font-medium text-accent hover:opacity-80">
            ← Back to dashboard
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-primary">Marketplace orders</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Monitor platform-wide orders, fulfillment health, and disputes in one place.
          </p>

          <div className="mt-6 space-y-3">
            {[
              { id: "ORD-2001", customer: "Sara R.", total: "$189.00" },
              { id: "ORD-2002", customer: "Darren M.", total: "$46.00" },
              { id: "ORD-2003", customer: "Leila K.", total: "$312.00" },
            ].map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
                <div>
                  <p className="font-semibold text-primary">{order.id}</p>
                  <p className="text-sm text-muted">{order.customer}</p>
                </div>
                <div className="text-sm font-medium text-primary">{order.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
