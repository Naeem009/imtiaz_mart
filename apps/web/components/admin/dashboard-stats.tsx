import type { AdminStatsDto } from "@imtiaz-mart/shared";
import { formatPrice } from "@/lib/utils/currency";

export function DashboardStats({ stats }: { stats: AdminStatsDto }) {
  const cards = [
    { label: "Users", value: String(stats.users) },
    { label: "Vendors", value: String(stats.vendors) },
    { label: "Products", value: String(stats.products) },
    { label: "Orders", value: String(stats.orders) },
    { label: "Revenue", value: formatPrice(stats.revenue) },
    { label: "Pending vendors", value: String(stats.pendingVendors) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-surface p-6">
          <p className="text-sm text-muted">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
