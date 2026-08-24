import type { ReviewDto } from "@imtiaz-mart/shared";
import { createReviewAction } from "@/lib/commerce/actions";

export function ProductReviews({
  slug,
  productId,
  reviews,
  canWrite,
  error,
}: {
  slug: string;
  productId: string;
  reviews: ReviewDto[];
  canWrite: boolean;
  error?: string;
}) {
  return (
    <section className="mt-12 border-t border-border pt-12">
      <h2 className="text-xl font-bold text-primary">Customer reviews</h2>
      {error ? (
        <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted">No reviews yet. Be the first to share your experience.</p>
        ) : (
          reviews.map((review) => (
            <article key={review.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-primary">{review.authorName}</p>
                <p className="text-sm text-warning">★ {review.rating}</p>
              </div>
              {review.title ? <p className="mt-1 text-sm font-medium text-primary">{review.title}</p> : null}
              <p className="mt-2 text-sm leading-6 text-muted">{review.body}</p>
              {review.isVerified ? (
                <p className="mt-2 text-xs font-medium text-success">Verified purchase</p>
              ) : null}
            </article>
          ))
        )}
      </div>

      {canWrite ? (
        <form action={createReviewAction} className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-6">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="slug" value={slug} />
          <h3 className="font-semibold text-primary">Write a review</h3>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Rating</span>
            <select name="rating" defaultValue="5" className="w-full rounded-lg border border-border px-4 py-2.5">
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Title (optional)</span>
            <input name="title" className="w-full rounded-lg border border-border px-4 py-2.5" />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Review</span>
            <textarea
              name="body"
              required
              minLength={10}
              rows={4}
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <button type="submit" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Submit review
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          <a href={`/login?redirect=/products/${slug}`} className="text-accent hover:underline">
            Sign in
          </a>{" "}
          to write a review.
        </p>
      )}
    </section>
  );
}
