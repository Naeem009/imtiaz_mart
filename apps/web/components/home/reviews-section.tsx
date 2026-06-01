import type { HomeReview } from "@/lib/data/homepage";
import { SectionHeader } from "@/components/ui/section-header";

interface ReviewsSectionProps {
  reviews: HomeReview[];
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Customer Reviews"
          subtitle="What shoppers are saying"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {reviews.map((review) => (
            <blockquote
              key={review.id}
              className="flex flex-col rounded-xl border border-border bg-surface p-6"
            >
              <div className="flex gap-0.5 text-warning" aria-label={`${review.rating} out of 5 stars`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <span key={i} aria-hidden>★</span>
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-text">
                &ldquo;{review.text}&rdquo;
              </p>
              <footer className="mt-4 border-t border-border pt-4">
                <cite className="not-italic">
                  <span className="font-medium text-primary">{review.author}</span>
                  <span className="mt-1 block text-xs text-muted">
                    on {review.product} · {review.date}
                  </span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
