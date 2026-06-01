import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchOrder } from "@/lib/cart/api";
import { getSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils/currency";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { orderNumber } = await params;
  const order = await fetchOrder(orderNumber);
  if (!order) notFound();

  return (
    <ShopShell>
      <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl text-success">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-bold text-primary">Order confirmed!</h1>
        <p className="mt-2 text-muted">
          Thank you for your order. We&apos;ve received it and will process it shortly.
        </p>
        <p className="mt-4 text-lg font-semibold text-primary">
          Order #{order.orderNumber}
        </p>
        <p className="text-sm text-muted">
          Status: <span className="capitalize">{order.status.toLowerCase()}</span>
        </p>

        <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-left">
          <h2 className="font-semibold text-primary">Items</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-muted">
                  {item.productName} ({item.variantName}) × {item.quantity}
                </span>
                <span className="font-medium text-primary">
                  {formatPrice(item.total)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatPrice(order.shippingAmount)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-primary">
              <dt>Total</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
          <div className="mt-6 border-t border-border pt-4 text-sm text-muted">
            <p className="font-medium text-primary">Ship to</p>
            <p className="mt-1">
              {order.shippingName}
              <br />
              {order.shippingLine1}
              {order.shippingLine2 && (
                <>
                  <br />
                  {order.shippingLine2}
                </>
              )}
              <br />
              {order.shippingCity}, {order.shippingPostal}
              <br />
              {order.shippingCountry}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/orders"
            className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-surface"
          >
            View all orders
          </Link>
          <Link
            href="/shop"
            className="rounded-lg bg-cta px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </ShopShell>
  );
}
