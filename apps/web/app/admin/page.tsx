import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { DashboardStats } from "@/components/admin/dashboard-stats";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAdminStats } from "@/lib/admin/api";

export const metadata = { title: "Admin dashboard" };

export default async function AdminPage() {
  await requireRoles(ADMIN_ROLES, "/admin");
  const stats = await fetchAdminStats();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Marketplace owner dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Manage vendors, monitor sales, and review marketplace analytics from this owner console.
          </p>
          <PortalNav current="/admin" links={adminNav} />
        </div>

        <div className="mt-8">
          {stats ? (
            <DashboardStats stats={stats} />
          ) : (
            <p className="text-sm text-muted">Could not load marketplace stats.</p>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
