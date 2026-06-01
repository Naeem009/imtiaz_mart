import Link from "next/link";
import { CartLineControls } from "@/components/cart/cart-line-controls";
import { ShopShell } from "@/components/layout/shop-shell";
import { fetchCart } from "@/lib/cart/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Cart" };

const SHIPPING_FEE = 250;
const FREE_SHIPPING_THRESHOLD = 2999;

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const cart = await fetchCart();
  const shipping =
    cart && cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = (cart?.subtotal ?? 0) + (cart?.items.length ? shipping : 0);

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold text-primary">Shopping cart</h1>

        {error && (
          <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
            {decodeURIComponent(error)}
          </p>
        )}

        {!cart?.items.length ? (
          <div className="mt-12 text-center">
            <p className="text-lg text-muted">Your cart is empty</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-lg bg-cta px-8 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-border bg-surface p-4"
                >
                  <Link
                    href={`/products/${item.product.slug}`}
                    className={`h-24 w-24 shrink-0 rounded-lg ${item.product.primaryImage?.startsWith("bg-") ? item.product.primaryImage : "bg-slate-200"}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="font-medium text-primary hover:text-accent"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted">{item.variant.name}</p>
                    <p className="mt-1 font-semibold text-primary">
                      {formatPrice(item.variant.price)}
                    </p>
                    <div className="mt-auto pt-3">
                      <CartLineControls
                        itemId={item.id}
                        quantity={item.quantity}
                        maxStock={item.variant.stock}
                      />
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold text-primary">
                    {formatPrice(item.lineTotal)}
                  </p>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-xl border border-border bg-surface p-6">
              <h2 className="text-lg font-semibold text-primary">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatPrice(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Shipping</dt>
                  <dd>
                    {shipping === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(total)}</dd>
                </div>
              </dl>
              {cart.subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="mt-3 text-xs text-muted">
                  Add {formatPrice(FREE_SHIPPING_THRESHOLD - cart.subtotal)} more for free shipping
                </p>
              )}
              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-cta py-3.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Proceed to checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
