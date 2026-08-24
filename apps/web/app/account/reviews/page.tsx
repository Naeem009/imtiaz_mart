import { redirect } from "next/navigation";
import { AccountShell } from "@/components/layout/account-shell";
import { getSession } from "@/lib/auth/session";
import { fetchMyReviews } from "@/lib/commerce/api";

export const metadata = { title: "My reviews" };

export default async function ReviewsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/reviews");
  const reviews = await fetchMyReviews();

  return (
    <AccountShell active="/account/reviews" title="My reviews">
      {reviews.length === 0 ? (
        <p className="text-muted">You have not written any reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-xl border border-border bg-surface p-5">
              <p className="font-medium text-primary">{review.productName}</p>
              <p className="mt-1 text-sm text-warning">★ {review.rating}</p>
              <p className="mt-2 text-sm text-muted">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
    </AccountShell>
  );
}
