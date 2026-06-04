import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Track order" };

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  if (orderNumber) {
    const user = await getSession();
    if (user) {
      redirect(`/orders/${orderNumber}`);
    }
  }

  return (
    <ShopShell>
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-primary">Track your order</h1>
        <p className="mt-3 text-muted">
          Sign in to view order status and delivery details.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/login?redirect=/account/orders"
            className="flex w-full items-center justify-center rounded-lg bg-cta py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Sign in to track orders
          </Link>
          <Link
            href="/account/orders"
            className="flex w-full items-center justify-center rounded-lg border border-border py-3 text-sm font-medium hover:bg-surface"
          >
            My orders
          </Link>
        </div>
        <p className="mt-8 text-xs text-muted">
          Have your order number from confirmation email? Sign in and visit My
          orders, or open the link from your order confirmation page.
        </p>
      </div>
    </ShopShell>
  );
}
