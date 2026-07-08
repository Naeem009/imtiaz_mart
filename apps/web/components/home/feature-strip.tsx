import Link from "next/link";

const items = [
  {
    title: "Explore vendors",
    body: "Browse trusted sellers and local storefronts",
    href: "/vendors",
    accent: false,
  },
  {
    title: "Become a seller",
    body: "Launch your storefront and start reaching buyers",
    href: "/vendor/register",
    accent: true,
  },
  {
    title: "Today's deals",
    body: "Discover limited-time offers and top discounts",
    href: "/deals",
    accent: false,
  },
];

export function FeatureStrip() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`rounded-xl border p-4 text-left transition ${
              item.accent
                ? "border-accent/30 bg-accent/10 hover:bg-accent/20"
                : "border-border bg-background hover:border-accent/40 hover:bg-accent/5"
            }`}
          >
            <p className={`font-semibold ${item.accent ? "text-accent" : "text-primary"}`}>
              {item.title}
            </p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
