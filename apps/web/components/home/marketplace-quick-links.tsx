import Link from "next/link";

const links = [
  { title: "Shop all products", href: "/shop", description: "Browse the latest arrivals and bestsellers" },
  { title: "Meet our vendors", href: "/vendors", description: "Discover trusted storefronts across Pakistan" },
  { title: "Start selling", href: "/vendor/register", description: "Open your vendor account in minutes" },
];

export function MarketplaceQuickLinks() {
  return (
    <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Marketplace shortcuts</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">Everything shoppers and sellers need</h2>
          </div>
          <Link href="/shop" className="text-sm font-medium text-accent hover:underline">
            Browse catalog →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="rounded-2xl border border-border bg-background p-5 transition hover:border-accent/40 hover:shadow-sm"
            >
              <p className="font-semibold text-primary">{link.title}</p>
              <p className="mt-2 text-sm text-muted">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
