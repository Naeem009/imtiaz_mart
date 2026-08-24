import { redirect } from "next/navigation";
import { AccountShell } from "@/components/layout/account-shell";
import { getSession } from "@/lib/auth/session";
import { fetchWishlist } from "@/lib/commerce/api";
import { formatPrice } from "@/lib/utils/currency";
import Link from "next/link";
import { removeWishlistAction } from "@/lib/commerce/actions";

export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/wishlist");
  const items = await fetchWishlist();

  return (
    <AccountShell active="/account/wishlist" title="Wishlist">
      {items.length === 0 ? (
        <p className="text-muted">Your wishlist is empty.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-4">
              <div>
                <Link href={`/products/${item.product.slug}`} className="font-medium text-primary hover:text-accent">
                  {item.product.name}
                </Link>
                <p className="text-sm text-muted">{formatPrice(item.product.price)}</p>
              </div>
              <form action={removeWishlistAction}>
                <input type="hidden" name="productId" value={item.productId} />
                <button type="submit" className="text-sm text-muted hover:text-error">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
