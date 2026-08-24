import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { joinAffiliateAction } from "@/lib/commerce/actions";
import { fetchAffiliate } from "@/lib/commerce/api";
import { getSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Affiliate program" };

export default async function AffiliatePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/affiliate");
  const { error } = await searchParams;
  const affiliate = await fetchAffiliate();

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Partners</p>
        <h1 className="mt-2 text-3xl font-bold text-primary">Affiliate program</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Share your referral link and earn 5% commission on paid referred orders.
        </p>
        {error ? (
          <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        {!affiliate ? (
          <form action={joinAffiliateAction} className="mt-8">
            <button
              type="submit"
              className="rounded-lg bg-cta px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Join the program
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <p className="text-sm text-muted">Referral code</p>
              <p className="mt-1 text-2xl font-semibold text-primary">{affiliate.code}</p>
              <p className="mt-3 break-all text-sm text-muted">{affiliate.referralUrl}</p>
              <p className="mt-4 text-sm text-muted">
                Status {affiliate.status} · Rate {(affiliate.commissionRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="text-sm text-muted">Pending</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{formatPrice(affiliate.pending)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface p-6">
                <p className="text-sm text-muted">Paid</p>
                <p className="mt-2 text-2xl font-semibold text-primary">{formatPrice(affiliate.paid)}</p>
              </div>
            </div>
            <ul className="space-y-2">
              {affiliate.commissions.map((row) => (
                <li
                  key={row.id}
                  className="flex justify-between rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <span className="text-muted">{row.status}</span>
                  <span className="font-medium text-primary">{formatPrice(row.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ShopShell>
  );
}
