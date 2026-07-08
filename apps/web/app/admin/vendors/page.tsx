import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Admin vendors" };

export default async function AdminVendorsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/admin/vendors");

  const roles = user.roles ?? [];
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Vendors</h1>
          </div>
          <Link href="/admin" className="text-sm font-medium text-accent hover:opacity-80">
            ← Back to dashboard
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-primary">Vendor management queue</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Approve onboarding requests, manage storefront status, and review vendor performance from here.
          </p>

          <div className="mt-6 space-y-3">
            {[
              { name: "Amina Design Co.", status: "Pending approval" },
              { name: "Northstar Goods", status: "Active" },
              { name: "Vintage Aura", status: "Needs review" },
            ].map((vendor) => (
              <div key={vendor.name} className="flex flex-wrap items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
                <div>
                  <p className="font-semibold text-primary">{vendor.name}</p>
                  <p className="text-sm text-muted">{vendor.status}</p>
                </div>
                <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary hover:bg-background">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
