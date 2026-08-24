import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { SocialAutomationAdmin } from "@/components/admin/social-automation-admin";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { fetchAdminSocialOverview } from "@/lib/admin/api";

export const metadata = { title: "Social automation admin" };

export default async function AdminSocialAutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/social-automation");
  const { error } = await searchParams;
  const overview = await fetchAdminSocialOverview();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Social automation</h1>
          <PortalNav current="/admin/social-automation" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8">
          {overview ? (
            <SocialAutomationAdmin overview={overview} />
          ) : (
            <p className="text-sm text-muted">Could not load social automation overview.</p>
          )}
        </div>
      </div>
    </ShopShell>
  );
}
