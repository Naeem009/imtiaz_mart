import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { updateAdminCustomerAction } from "@/lib/admin/actions";
import { fetchAdminCustomers } from "@/lib/admin/api";

export const metadata = { title: "Admin customers" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/customers");
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = params.q?.trim() ?? "";
  const result = await fetchAdminCustomers({ page, q: q || undefined });
  const data = result?.data ?? [];
  const meta = result?.meta;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Customers</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Search accounts, review roles, and deactivate users who should not sign in.
          </p>
          <PortalNav current="/admin/customers" links={adminNav} />
        </div>

        {params.error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {decodeURIComponent(params.error)}
          </p>
        ) : null}

        <form className="mt-8 flex flex-wrap gap-3" action="/admin/customers">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search email or name"
            className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <button type="submit" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Search
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No customers found.
            </div>
          ) : (
            data.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-primary">{user.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {user.email} · {user.roles.join(", ") || "no roles"} · {user.orderCount} orders
                    {user.isActive ? "" : " · Inactive"}
                  </p>
                </div>
                <form action={updateAdminCustomerAction}>
                  <input type="hidden" name="id" value={user.id} />
                  <input type="hidden" name="isActive" value={user.isActive ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background"
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </button>
                </form>
              </div>
            ))
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex gap-3">
            {page > 1 ? (
              <Link
                href={`/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) }).toString()}`}
                className="text-sm font-medium text-accent"
              >
                Previous
              </Link>
            ) : null}
            {page < meta.totalPages ? (
              <Link
                href={`/admin/customers?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) }).toString()}`}
                className="text-sm font-medium text-accent"
              >
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShopShell>
  );
}
