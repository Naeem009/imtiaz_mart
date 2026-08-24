import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorPayouts } from "@/lib/vendor/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Vendor payouts" };

export default async function VendorPayoutsPage() {
  await requireRoles(VENDOR_ROLES, "/vendor/payouts");
  const payouts = await fetchVendorPayouts();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Payouts</h1>
          <PortalNav current="/vendor/payouts" links={vendorNav} />
        </div>

        <div className="mt-8 space-y-3">
          {payouts.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No payouts yet. Escrow releases after paid orders settle.
            </div>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-medium text-primary">{payout.reference ?? payout.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted">{payout.status}</p>
                </div>
                <p className="text-sm font-semibold text-primary">{formatPrice(payout.amount)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
