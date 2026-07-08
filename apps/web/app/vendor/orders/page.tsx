import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Vendor orders" };

export default async function VendorOrdersPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor/orders");

  const roles = user.roles ?? [];
  const isVendor = roles.includes("vendor") || roles.includes("vendor_staff");
  if (!isVendor) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Orders</h1>
          </div>
          <Link href="/vendor" className="text-sm font-medium text-accent hover:opacity-80">
            ← Back to dashboard
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-primary">Vendor order center</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            This panel is now ready to display fulfillment, shipment, and return workflows for your catalog.
          </p>

          <div className="mt-6 space-y-3">
            {[
              { id: "ORD-1042", status: "Processing", amount: "$248.00" },
              { id: "ORD-1043", status: "Packed", amount: "$84.50" },
              { id: "ORD-1045", status: "Shipped", amount: "$132.00" },
            ].map((order) => (
              <div key={order.id} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
                <div>
                  <p className="font-semibold text-primary">{order.id}</p>
                  <p className="text-sm text-muted">Status: {order.status}</p>
                </div>
                <div className="text-sm font-medium text-primary">{order.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
