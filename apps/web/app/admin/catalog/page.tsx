import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import {
  createAdminCategoryAction,
  createAdminProductAction,
  deleteAdminCategoryAction,
  deleteAdminProductAction,
  updateAdminCategoryAction,
  updateAdminProductDetailsAction,
} from "@/lib/admin/actions";
import { fetchAdminCatalogVendors, fetchAdminCategories } from "@/lib/admin/api";
import { fetchAdminProducts } from "@/lib/admin/api";

export const metadata = { title: "Admin catalog" };
const STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"];

export default async function AdminCatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/catalog");
  const { error } = await searchParams;
  const [categories, vendors, products] = await Promise.all([
    fetchAdminCategories(),
    fetchAdminCatalogVendors(),
    fetchAdminProducts({ page: 1 }),
  ]);
  const categoryRows = categories ?? [];
  const vendorRows = vendors ?? [];
  const productRows = products?.data ?? [];

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Admin panel / Catalog</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">Catalog workspace</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">Shape the departments and listings customers see across the marketplace.</p>
            </div>
            <div className="flex gap-5 text-sm text-muted"><span><strong className="text-primary">{categoryRows.length}</strong> categories</span><span><strong className="text-primary">{products?.meta.total ?? 0}</strong> products</span></div>
          </div>
          <PortalNav current="/admin/catalog" links={adminNav} />
        </div>

        {error ? <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error" role="alert">{decodeURIComponent(error)}</p> : null}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">New category</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">Create a department</h2>
            <form action={createAdminCategoryAction} className="mt-5 space-y-4">
              <Field name="name" label="Category name" placeholder="Fresh produce" required />
              <Field name="description" label="Description" placeholder="A short customer-facing description" />
              <Field name="imageUrl" label="Image URL" placeholder="https://..." type="url" />
              <div className="grid grid-cols-2 gap-3"><Field name="sortOrder" label="Sort order" type="number" defaultValue="0" /><div /></div>
              <button className="w-full rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-white hover:opacity-90" type="submit">Add category</button>
            </form>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">New product</p>
            <h2 className="mt-2 text-xl font-semibold text-primary">Add a marketplace listing</h2>
            {vendorRows.length === 0 || categoryRows.length === 0 ? <p className="mt-5 rounded-lg bg-warning/10 p-3 text-sm text-primary">Create at least one vendor and category before adding products.</p> : <form action={createAdminProductAction} className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field name="name" label="Product name" placeholder="Organic basmati rice" required /></div>
              <Select name="categoryId" label="Category" options={categoryRows.map((row) => ({ value: row.id, label: row.name }))} />
              <Select name="vendorId" label="Vendor" options={vendorRows.map((row) => ({ value: row.id, label: row.name }))} />
              <Field name="price" label="Price (PKR)" type="number" min="0" step="0.01" required />
              <Field name="stock" label="Opening stock" type="number" min="0" defaultValue="0" required />
              <Select name="status" label="Status" options={STATUSES.map((value) => ({ value, label: value }))} />
              <Field name="imageUrl" label="Image URL" type="url" placeholder="https://..." />
              <div className="sm:col-span-2"><Field name="shortDescription" label="Short description" placeholder="One line shown in listings" /></div>
              <button className="sm:col-span-2 rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-white hover:opacity-90" type="submit">Add product</button>
            </form>}
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Departments</p><h2 className="mt-2 text-xl font-semibold text-primary">Manage categories</h2></div><p className="text-sm text-muted">Archive empty categories to remove them from the storefront.</p></div>
          <div className="mt-5 divide-y divide-border">
            {categoryRows.map((category) => <div key={category.id} className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center"><form action={updateAdminCategoryAction} className="grid gap-3 sm:grid-cols-3"><input type="hidden" name="id" value={category.id} /><input name="name" defaultValue={category.name} required className={inputClass} /><input name="description" defaultValue={category.description ?? ""} placeholder="Description" className={inputClass} /><input name="sortOrder" type="number" min="0" defaultValue={category.sortOrder} className={inputClass} /><button className="text-left text-sm font-semibold text-accent hover:underline" type="submit">Save changes</button></form><div className="flex items-center gap-4 text-sm text-muted"><span>{category._count.products} products</span>{category._count.products === 0 ? <form action={deleteAdminCategoryAction}><input type="hidden" name="id" value={category.id} /><button className="font-semibold text-error hover:underline" type="submit">Archive</button></form> : null}</div></div>)}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Listings</p><h2 className="mt-2 text-xl font-semibold text-primary">Manage products</h2></div><a href="/admin/products" className="text-sm font-semibold text-accent hover:underline">Advanced filters</a></div>
          <div className="mt-5 divide-y divide-border">
            {productRows.map((product) => <div key={product.id} className="grid gap-4 py-4 md:grid-cols-[1fr_auto] md:items-center"><form action={updateAdminProductDetailsAction} className="grid gap-3 sm:grid-cols-4"><input type="hidden" name="id" value={product.id} /><input name="name" defaultValue={product.name} required className={`${inputClass} sm:col-span-2`} /><input name="price" type="number" min="0" step="0.01" defaultValue={product.price} className={inputClass} /><input name="stock" type="number" min="0" defaultValue={product.stock} className={inputClass} /><Select name="categoryId" label="" value={categoryRows.find((row) => row.name === product.categoryName)?.id} options={categoryRows.map((row) => ({ value: row.id, label: row.name }))} /><Select name="status" label="" value={product.status} options={STATUSES.map((value) => ({ value, label: value }))} /><button className="text-left text-sm font-semibold text-accent hover:underline" type="submit">Save</button></form><form action={deleteAdminProductAction}><input type="hidden" name="id" value={product.id} /><button className="text-sm font-semibold text-error hover:underline" type="submit">Archive</button></form></div>)}
          </div>
        </section>
      </div>
    </ShopShell>
  );
}

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-primary outline-none focus:border-accent";
function Field({ name, label, placeholder, type = "text", defaultValue, required, min, step }: { name: string; label: string; placeholder?: string; type?: string; defaultValue?: string; required?: boolean; min?: string; step?: string }) { return <label className="block text-sm"><span className="mb-1.5 block font-medium text-primary">{label}</span><input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} min={min} step={step} className={inputClass} /></label>; }
function Select({ name, label, options, value }: { name: string; label: string; options: { value: string; label: string }[]; value?: string }) { return <label className="block text-sm"><span className="mb-1.5 block font-medium text-primary">{label}</span><select name={name} defaultValue={value ?? options[0]?.value} className={inputClass}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
