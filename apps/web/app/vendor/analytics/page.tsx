import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { VendorStats } from "@/components/vendor/vendor-stats";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorAnalytics } from "@/lib/vendor/api";

export const metadata = { title: "Vendor analytics" };

export default async function VendorAnalyticsPage() {
  await requireRoles(VENDOR_ROLES, "/vendor/analytics");
  const stats = await fetchVendorAnalytics();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Analytics</h1>
          <PortalNav current="/vendor/analytics" links={vendorNav} />
        </div>

        <div className="mt-8">
          {stats ? (
            <VendorStats stats={stats} />
          ) : (
            <p className="text-sm text-muted">No vendor stats available.</p>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
