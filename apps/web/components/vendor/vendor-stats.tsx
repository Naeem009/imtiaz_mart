import type { VendorAnalyticsDto } from "@imtiaz-mart/shared";
import { formatPrice } from "@/lib/utils/currency";

export function VendorStats({ stats }: { stats: VendorAnalyticsDto }) {
  const cards = [
    { label: "Products", value: String(stats.products) },
    { label: "Active listings", value: String(stats.activeProducts) },
    { label: "Orders", value: String(stats.orders) },
    { label: "Pending orders", value: String(stats.pendingOrders) },
    { label: "Revenue", value: formatPrice(stats.revenue) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
