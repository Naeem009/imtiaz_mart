import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { VendorStats } from "@/components/vendor/vendor-stats";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorAnalytics, fetchVendorProfile } from "@/lib/vendor/api";

export const metadata = { title: "Vendor dashboard" };

export default async function VendorDashboardPage() {
  await requireRoles(VENDOR_ROLES, "/vendor");
  const [profile, analytics] = await Promise.all([
    fetchVendorProfile(),
    fetchVendorAnalytics(),
  ]);

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">
            {profile?.name ?? "Vendor dashboard"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            {profile?.description ?? "Manage your product catalog, review orders, and track performance from one place."}
          </p>
          {profile ? (
            <p className="mt-4 text-sm text-muted">
              Storefront:{" "}
              <Link href={`/vendors/${profile.slug}`} className="font-medium text-accent hover:underline">
                /vendors/{profile.slug}
              </Link>
              {profile.isVerified ? " · Verified" : " · Pending verification"}
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">Could not load store profile. Try signing in again.</p>
          )}
          <PortalNav current="/vendor" links={vendorNav} />
        </div>

        <div className="mt-8">
          {analytics ? (
            <VendorStats stats={analytics} />
          ) : (
            <p className="text-sm text-muted">Analytics are unavailable right now.</p>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
