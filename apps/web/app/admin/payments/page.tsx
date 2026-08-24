import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { markPaymentPaidAction } from "@/lib/admin/actions";
import { fetchAdminPayments } from "@/lib/commerce/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Admin payments" };

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/payments");
  const { error } = await searchParams;
  const payments = await fetchAdminPayments();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Payments</h1>
          <PortalNav current="/admin/payments" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 space-y-3">
          {payments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No payments recorded yet.
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-primary">#{payment.orderNumber}</p>
                  <p className="text-sm text-muted">
                    {payment.method} · {payment.status}
                    {payment.gateway ? ` · ${payment.gateway}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium text-primary">{formatPrice(payment.amount)}</p>
                  {payment.status === "PENDING" ? (
                    <form action={markPaymentPaidAction}>
                      <input type="hidden" name="id" value={payment.id} />
                      <button
                        type="submit"
                        className="rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Mark paid
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}
