import { newsletterAction } from "@/lib/actions/newsletter";

export function NewsletterSection() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-primary px-6 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Get deals in your inbox
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/80">
            Subscribe for exclusive offers, new arrivals, and marketplace updates.
          </p>
          <form
            action={newsletterAction}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
              className="flex-1 rounded-lg border-0 px-4 py-3 text-sm text-primary outline-none ring-2 ring-transparent focus:ring-accent"
            />
            <button
              type="submit"
              className="rounded-lg bg-cta px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-4 text-xs text-white/60">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
