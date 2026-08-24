import { addToWishlistAction } from "@/lib/commerce/actions";

export function WishlistButton({ productId, slug }: { productId: string; slug: string }) {
  return (
    <form action={addToWishlistAction}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="text-sm text-muted hover:text-accent">
        ♡ Wishlist
      </button>
    </form>
  );
}
