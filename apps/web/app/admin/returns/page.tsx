import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { updateReturnStatusAction } from "@/lib/admin/actions";
import { fetchAdminReturns } from "@/lib/commerce/api";

export const metadata = { title: "Admin returns" };

const STATUSES = ["REQUESTED", "APPROVED", "REJECTED", "RECEIVED", "REFUNDED"];

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/returns");
  const { error } = await searchParams;
  const returns = await fetchAdminReturns();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Returns</h1>
          <PortalNav current="/admin/returns" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 space-y-3">
          {returns.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No return requests yet.
            </div>
          ) : (
            returns.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-surface px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-primary">#{item.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted">{item.reason}</p>
                    <p className="mt-1 text-xs text-muted">
                      {item.items.map((row) => `${row.productName} × ${row.quantity}`).join(", ")}
                    </p>
                  </div>
                  <form action={updateReturnStatusAction} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={item.id} />
                    <select
                      name="status"
                      defaultValue={item.status}
                      className="rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Update
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
