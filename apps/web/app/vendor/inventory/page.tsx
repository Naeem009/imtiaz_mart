import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, vendorNav } from "@/components/layout/portal-nav";
import { requireRoles, VENDOR_ROLES } from "@/lib/auth/require-roles";
import { fetchVendorInventory, fetchVendorProducts } from "@/lib/vendor/api";
import { adjustVendorInventoryAction, createVendorWarehouseAction } from "@/lib/vendor/actions";

export const metadata = { title: "Vendor inventory" };

export default async function VendorInventoryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireRoles(VENDOR_ROLES, "/vendor/inventory");
  const [{ error }, inventory, products] = await Promise.all([searchParams, fetchVendorInventory(), fetchVendorProducts()]);
  const variants = (products ?? []).flatMap((product) => product.variants.map((variant) => ({ ...variant, productName: product.name })));

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Inventory and warehouses</h1>
          <PortalNav current="/vendor/inventory" links={vendorNav} />
        </div>
        {error ? <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">{error}</p> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold text-primary">Add warehouse</h2>
            <form action={createVendorWarehouseAction} className="mt-5 space-y-3">
              <input name="name" required placeholder="Warehouse name" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="city" placeholder="City" className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="country" defaultValue="PK" maxLength={2} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <button className="w-full rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white">Create warehouse</button>
            </form>
            <h2 className="mt-8 text-xl font-semibold text-primary">Warehouses</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {(inventory?.warehouses ?? []).map((warehouse) => <li key={warehouse.id}>{warehouse.name}{warehouse.city ? ` · ${warehouse.city}` : ""}</li>)}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-xl font-semibold text-primary">Adjust stock</h2>
            <form action={adjustVendorInventoryAction} className="mt-5 grid gap-3 sm:grid-cols-2">
              <select name="warehouseId" required className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                {(inventory?.warehouses ?? []).map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
              <select name="variantId" required className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                {variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.productName} · {variant.name}</option>)}
              </select>
              <input name="delta" type="number" required placeholder="Quantity change (+/-)" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <select name="type" defaultValue="ADJUSTMENT" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
                <option value="RESTOCK">Restock</option><option value="ADJUSTMENT">Adjustment</option><option value="RETURN">Return</option>
              </select>
              <input name="lowStockThreshold" type="number" min={0} defaultValue={5} placeholder="Low-stock threshold" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <input name="reason" placeholder="Reason" className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
              <button className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white sm:col-span-2">Save stock adjustment</button>
            </form>
            <div className="mt-8 space-y-3">
              {(inventory?.items ?? []).map((item) => <div key={item.id} className="flex justify-between rounded-lg border border-border px-4 py-3 text-sm"><span className="text-primary">{item.variant.product.name} · {item.variant.name}<span className="block text-xs text-muted">{item.warehouse.name}</span></span><span className={item.quantity <= item.lowStockThreshold ? "font-semibold text-warning" : "font-semibold text-success"}>{item.quantity}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}