import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAdminStats } from "@/lib/admin/api";

export const metadata = { title: "Admin analytics" };

export default async function AdminAnalyticsPage() {
  await requireRoles(ADMIN_ROLES, "/admin/analytics");
  const stats = await fetchAdminStats();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin analytics</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Platform analytics</h1>
          <PortalNav current="/admin/analytics" links={adminNav} />
        </div>

        <div className="mt-8">
          {stats ? (
            <DashboardStats stats={stats} />
          ) : (
            <p className="text-sm text-muted">No stats available.</p>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
