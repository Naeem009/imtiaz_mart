import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { SocialAutomationSettings } from "@/components/vendor/social-automation-settings";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import {
  fetchSocialAccounts,
  fetchSocialAnalytics,
  fetchSocialQueue,
  fetchSocialRules,
} from "@/lib/vendor/api";

export const metadata = { title: "Social Automation" };

export default async function VendorSocialAutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; draft?: string }>;
}) {
  await requireRoles(VENDOR_ROLES, "/vendor/social-automation");
  const { error, draft } = await searchParams;
  const [accounts, rules, queue, analytics] = await Promise.all([
    fetchSocialAccounts(),
    fetchSocialRules(),
    fetchSocialQueue(),
    fetchSocialAnalytics(),
  ]);

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Social automation</h1>
          <PortalNav current="/vendor/social-automation" links={vendorNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8">
          <SocialAutomationSettings
            accounts={accounts ?? []}
            rules={rules ?? []}
            queue={queue ?? []}
            analytics={analytics}
            draft={draft}
          />
        </div>
      </div>
    </ShopShell>
  );
}
