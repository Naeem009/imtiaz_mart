import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAgentEligibility, fetchAgentFeedStatus } from "@/lib/admin/api";
import { updateEligibilityAction } from "@/lib/admin/actions";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Agent commerce" };

export default async function AdminAgentCommercePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/agent-commerce");
  const { error } = await searchParams;
  const [eligibility, feeds] = await Promise.all([
    fetchAgentEligibility(),
    fetchAgentFeedStatus(),
  ]);
  const apiOrigin = siteConfig.apiUrl.replace(/\/api\/v1\/?$/, "");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Agent commerce feeds</h1>
          <PortalNav current="/admin/agent-commerce" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        {feeds ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeedCard
              name="UCP"
              count={feeds.ucp.count}
              href={`${apiOrigin}${feeds.ucp.path}`}
            />
            <FeedCard
              name="ACP"
              count={feeds.acp.count}
              href={`${apiOrigin}${feeds.acp.path}`}
            />
            <FeedCard
              name="Perplexity"
              count={feeds.perplexity.count}
              href={`${apiOrigin}${feeds.perplexity.path}`}
            />
          </div>
        ) : null}

        <div className="mt-8 space-y-3">
          {(eligibility ?? []).length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No products available for eligibility review.
            </div>
          ) : (
            (eligibility ?? []).map((product) => (
              <form
                key={product.id}
                action={updateEligibilityAction}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-primary">{product.name}</p>
                  <p className="text-sm text-muted">
                    {product.vendorName} · {product.status}
                  </p>
                </div>
                <input type="hidden" name="productId" value={product.id} />
                <label className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    name="isEligibleSearch"
                    defaultChecked={product.isEligibleSearch}
                  />
                  Search
                </label>
                <label className="flex items-center gap-2 text-sm text-primary">
                  <input
                    type="checkbox"
                    name="isEligibleCheckout"
                    defaultChecked={product.isEligibleCheckout}
                  />
                  Checkout
                </label>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background"
                >
                  Save
                </button>
              </form>
            ))
          )}
        </div>
      </div>
    </ShopShell>
  );
}

function FeedCard({
  name,
  count,
  href,
}: {
  name: string;
  count: number;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-2xl border border-border bg-surface p-6 transition hover:border-accent/60"
    >
      <p className="text-sm text-muted">{name} feed</p>
      <p className="mt-2 text-2xl font-semibold text-primary">{count} products</p>
      <p className="mt-2 text-xs text-accent">{href}</p>
    </a>
  );
}
