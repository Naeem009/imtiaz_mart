import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { checkoutAction } from "@/lib/cart/actions";
import { fetchCart } from "@/lib/cart/api";
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
  const cart = await fetchCart();

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

        <form action={checkoutAction} className="mt-8 space-y-6">
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-primary">
              Shipping address
            </legend>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingName">
                Full name
              </label>
              <input
                id="shippingName"
                name="shippingName"
                required
                defaultValue={[user.firstName, user.lastName].filter(Boolean).join(" ")}
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingPhone">
                Phone
              </label>
              <input
                id="shippingPhone"
                name="shippingPhone"
                type="tel"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingLine1">
                Address line 1
              </label>
              <input
                id="shippingLine1"
                name="shippingLine1"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingLine2">
                Address line 2 (optional)
              </label>
              <input
                id="shippingLine2"
                name="shippingLine2"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingCity">
                  City
                </label>
                <input
                  id="shippingCity"
                  name="shippingCity"
                  required
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="shippingPostal">
                  Postal code
                </label>
                <input
                  id="shippingPostal"
                  name="shippingPostal"
                  required
                  className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
                />
              </div>
            </div>
            <input type="hidden" name="shippingCountry" value="PK" />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-lg font-semibold text-primary">Payment</legend>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 has-[:checked]:border-accent has-[:checked]:bg-accent/5">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                defaultChecked
                className="text-accent"
              />
              <span>
                <span className="font-medium text-primary">Cash on delivery</span>
                <span className="mt-0.5 block text-sm text-muted">
                  Pay when your order arrives
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 opacity-60">
              <input type="radio" name="paymentMethod" value="card" disabled />
              <span>
                <span className="font-medium text-primary">Card payment</span>
                <span className="mt-0.5 block text-sm text-muted">Coming soon</span>
              </span>
            </label>
          </fieldset>

          <button
            type="submit"
            className="w-full rounded-lg bg-cta py-4 text-sm font-semibold text-white hover:opacity-90"
          >
            Place order — {formatPrice(total)}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          <Link href="/cart" className="text-accent hover:underline">
            ← Back to cart
          </Link>
        </p>
      </div>
    </ShopShell>
  );
}
