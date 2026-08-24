import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorOrders } from "@/lib/vendor/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Vendor orders" };

export default async function VendorOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRoles(VENDOR_ROLES, "/vendor/orders");
  const { page } = await searchParams;
  const current = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const orders = await fetchVendorOrders(current);
  const data = orders?.data ?? [];
  const meta = orders?.meta;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Orders</h1>
          <PortalNav current="/vendor/orders" links={vendorNav} />
        </div>

        <div className="mt-8 space-y-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No orders contain your products yet.
            </div>
          ) : (
            data.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-primary">{order.orderNumber}</p>
                    <p className="text-sm text-muted">
                      {order.customerName} · {order.status}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-primary">{formatPrice(order.vendorTotal)}</p>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {order.items.map((item) => (
                    <li key={item.id}>
                      {item.quantity} × {item.productName} — {formatPrice(item.total)}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex gap-3">
            {current > 1 ? (
              <Link href={`/vendor/orders?page=${current - 1}`} className="text-sm font-medium text-accent">
                Previous
              </Link>
            ) : null}
            {current < meta.totalPages ? (
              <Link href={`/vendor/orders?page=${current + 1}`} className="text-sm font-medium text-accent">
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShopShell>
  );
}
