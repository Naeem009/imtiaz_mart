import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAdminOrders } from "@/lib/admin/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Admin orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/orders");
  const { page } = await searchParams;
  const current = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const orders = await fetchAdminOrders(current);
  const data = orders?.data ?? [];
  const meta = orders?.meta;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Orders</h1>
          <PortalNav current="/admin/orders" links={adminNav} />
        </div>

        <div className="mt-8 space-y-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No marketplace orders yet.
            </div>
          ) : (
            data.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-primary">{order.orderNumber}</p>
                  <p className="text-sm text-muted">
                    {order.customerName} · {order.status} · {order.itemCount} items
                  </p>
                </div>
                <p className="text-sm font-medium text-primary">{formatPrice(order.total)}</p>
              </div>
            ))
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex gap-3">
            {current > 1 ? (
              <Link href={`/admin/orders?page=${current - 1}`} className="text-sm font-medium text-accent">
                Previous
              </Link>
            ) : null}
            {current < meta.totalPages ? (
              <Link href={`/admin/orders?page=${current + 1}`} className="text-sm font-medium text-accent">
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShopShell>
  );
}
