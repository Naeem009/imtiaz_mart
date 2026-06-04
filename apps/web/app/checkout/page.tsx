import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchCart } from "@/lib/cart/api";
import { fetchAddresses } from "@/lib/customer/api";
import { getSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Checkout" };

const SHIPPING_FEE = 250;
const FREE_SHIPPING_THRESHOLD = 2999;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const { error } = await searchParams;
  const [cart, addresses] = await Promise.all([fetchCart(), fetchAddresses()]);

  if (!cart?.items.length) {
    redirect("/cart");
  }

  const shipping =
    cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = cart.subtotal + shipping;

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Checkout</h1>

        {error && (
          <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {decodeURIComponent(error)}
          </p>
        )}

        <div className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-primary">Order summary</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between text-muted">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-primary">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>

        <CheckoutForm
          user={user}
          addresses={addresses}
          subtotal={cart.subtotal}
          shipping={shipping}
          total={total}
        />

        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/cart" className="text-accent hover:underline">
            ← Back to cart
          </Link>
          {addresses.length === 0 && (
            <>
              {" · "}
              <Link href="/account/addresses" className="text-accent hover:underline">
                Save addresses for faster checkout
              </Link>
            </>
          )}
        </p>
      </div>
    </ShopShell>
  );
}
