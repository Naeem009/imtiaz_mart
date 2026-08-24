import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAdminVendors } from "@/lib/admin/api";
import { updateVendorStatusAction } from "@/lib/admin/actions";

export const metadata = { title: "Admin vendors" };

export default async function AdminVendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/vendors");
  const { error } = await searchParams;
  const vendors = (await fetchAdminVendors()) ?? [];

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Vendors</h1>
          <PortalNav current="/admin/vendors" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 space-y-3">
          {vendors.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No vendors found.
            </div>
          ) : (
            vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-primary">{vendor.name}</p>
                  <p className="text-sm text-muted">
                    {vendor.ownerEmail ?? "No owner email"} · {vendor.productCount} products · {vendor.subscriptionTier}
                    {vendor.isVerified ? " · Verified" : " · Pending"}
                    {vendor.isActive ? "" : " · Inactive"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!vendor.isVerified ? (
                    <form action={updateVendorStatusAction}>
                      <input type="hidden" name="id" value={vendor.id} />
                      <input type="hidden" name="isVerified" value="true" />
                      <input type="hidden" name="isActive" value={vendor.isActive ? "true" : "false"} />
                      <button
                        type="submit"
                        className="rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Approve
                      </button>
                    </form>
                  ) : null}
                  <form action={updateVendorStatusAction}>
                    <input type="hidden" name="id" value={vendor.id} />
                    <input type="hidden" name="isVerified" value={vendor.isVerified ? "true" : "false"} />
                    <input type="hidden" name="isActive" value={vendor.isActive ? "false" : "true"} />
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background"
                    >
                      {vendor.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
