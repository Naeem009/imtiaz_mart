import DashboardStats from "@/components/admin/dashboard-stats";
import { ShopShell } from "@/components/layout/shop-shell";

export default function AdminAnalyticsPage() {
  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin analytics</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Platform analytics</h1>
          </div>
        </div>

        <div className="mt-8">
          <DashboardStats />
        </div>
      </div>
    </ShopShell>
  );
}
