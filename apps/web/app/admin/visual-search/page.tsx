import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { VisualSearchAdmin } from "@/components/admin/visual-search-admin";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";

export const metadata = { title: "Visual search admin" };

export default async function AdminVisualSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; indexed?: string; total?: string; engine?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/visual-search");
  const { error, indexed, total, engine } = await searchParams;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Visual search</h1>
          <PortalNav current="/admin/visual-search" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8">
          <VisualSearchAdmin indexed={indexed} total={total} engine={engine} />
        </div>
      </div>
    </ShopShell>
  );
}
