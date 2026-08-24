import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { upsertCmsPageAction } from "@/lib/admin/actions";
import { fetchAdminCmsPages } from "@/lib/commerce/api";

export const metadata = { title: "Admin CMS" };

export default async function AdminCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/cms");
  const { error } = await searchParams;
  const pages = await fetchAdminCmsPages();

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">CMS</h1>
          <PortalNav current="/admin/cms" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <form action={upsertCmsPageAction} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold text-primary">Create or update a page</h2>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Title</span>
              <input name="title" required className="w-full rounded-lg border border-border px-4 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Slug</span>
              <input name="slug" required className="w-full rounded-lg border border-border px-4 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Excerpt</span>
              <input name="excerpt" className="w-full rounded-lg border border-border px-4 py-2.5" />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">Body</span>
              <textarea name="body" required minLength={10} rows={8} className="w-full rounded-lg border border-border px-4 py-2.5" />
            </label>
            <button type="submit" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
              Save page
            </button>
          </form>

          <div className="space-y-3">
            {pages.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
                No CMS pages yet. Seed the database or create one here.
              </p>
            ) : (
              pages.map((page) => (
                <a
                  key={page.id}
                  href={`/pages/${page.slug}`}
                  className="block rounded-2xl border border-border bg-surface px-5 py-4 hover:border-accent/60"
                >
                  <p className="font-medium text-primary">{page.title}</p>
                  <p className="mt-1 text-sm text-muted">/{page.slug}</p>
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
