import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountShell } from "@/components/layout/account-shell";
import { fetchMyOrders } from "@/lib/cart/api";
import { getSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "My orders" };

export default async function OrdersPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/orders");

  const orders = await fetchMyOrders();

  return (
    <AccountShell active="/account/orders" title="My orders">
      {!orders.length ? (
        <p className="text-muted">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/orders/${order.orderNumber}`}
                className="block rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-primary">
                      #{order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted capitalize">
                      {order.status.toLowerCase()} ·{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-PK")}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
