import Link from "next/link";
import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { updateAdminProductAction } from "@/lib/admin/actions";
import { approveAdminProductAction, rejectAdminProductAction } from "@/lib/admin/actions";
import { fetchAdminProducts } from "@/lib/admin/api";
import { formatPrice } from "@/lib/utils/currency";

export const metadata = { title: "Admin products" };

const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];

function pageHref(page: number, q: string, status: string) {
  const search = new URLSearchParams();
  if (q) search.set("q", q);
  if (status) search.set("status", status);
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `/admin/products?${qs}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; status?: string; error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/products");
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const result = await fetchAdminProducts({ page, q: q || undefined, status: status || undefined });
  const data = result?.data ?? [];
  const meta = result?.meta;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Products</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Review vendor listings, change status, and control AI discovery flags.
          </p>
          <PortalNav current="/admin/products" links={adminNav} />
        </div>

        {params.error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {decodeURIComponent(params.error)}
          </p>
        ) : null}

        <form className="mt-8 flex flex-wrap gap-3" action="/admin/products">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, slug, or vendor"
            className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          >
            <option value="">All statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            Filter
          </button>
        </form>

        <div className="mt-6 space-y-3">
          {data.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-sm text-muted">
              No products match these filters.
            </div>
          ) : (
            data.map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-border bg-surface px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-semibold text-primary hover:text-accent"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {product.vendorName} · {product.categoryName} · {formatPrice(product.price)} · {product.stock} in stock
                    </p>
                  </div>
                  <form action={updateAdminProductAction} className="flex flex-wrap items-center gap-3">
                    <input type="hidden" name="id" value={product.id} />
                    <select
                      name="status"
                      defaultValue={product.status}
                      className="rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
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
                      Agent checkout
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-cta px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Save
                    </button>
                  </form>
                  {product.approvalStatus === "PENDING" ? (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      <input
                        form={`review-${product.id}`}
                        name="note"
                        placeholder="Review note (optional)"
                        className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                      <form id={`review-${product.id}`} className="contents">
                        <input type="hidden" name="id" value={product.id} />
                      </form>
                      <button form={`review-${product.id}`} formAction={approveAdminProductAction} className="rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white">
                        Approve
                      </button>
                      <button form={`review-${product.id}`} formAction={rejectAdminProductAction} className="rounded-lg border border-error px-4 py-2 text-sm font-semibold text-error">
                        Reject
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {meta && meta.totalPages > 1 ? (
          <div className="mt-6 flex gap-3">
            {page > 1 ? (
              <Link href={pageHref(page - 1, q, status)} className="text-sm font-medium text-accent">
                Previous
              </Link>
            ) : null}
            {page < meta.totalPages ? (
              <Link href={pageHref(page + 1, q, status)} className="text-sm font-medium text-accent">
                Next
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </ShopShell>
  );
}
