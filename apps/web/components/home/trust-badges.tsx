import { trustBadges } from "@/lib/data/homepage";

const icons: Record<string, string> = {
  lock: "🔒",
  return: "↩",
  verified: "✓",
  support: "💬",
};

export function TrustBadges() {
  return (
    <section className="border-t border-border py-8" aria-label="Trust and guarantees">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center text-center"
            >
              <span className="text-2xl" aria-hidden>
                {icons[badge.icon]}
              </span>
              <span className="mt-2 text-sm font-medium text-primary">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
