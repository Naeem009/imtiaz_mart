import Link from "next/link";
import { redirect } from "next/navigation";
import { ShopShell } from "@/components/layout/shop-shell";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Vendor analytics" };

export default async function VendorAnalyticsPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor/analytics");

  const roles = user.roles ?? [];
  const isVendor = roles.includes("vendor") || roles.includes("vendor_staff");
  if (!isVendor) redirect("/account");

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Vendor portal</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Analytics</h1>
          </div>
          <Link href="/vendor" className="text-sm font-medium text-accent hover:opacity-80">
            ← Back to dashboard
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm text-muted">Revenue</p>
            <p className="mt-2 text-3xl font-semibold text-primary">$12,840</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm text-muted">Conversion rate</p>
            <p className="mt-2 text-3xl font-semibold text-primary">4.8%</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <p className="text-sm text-muted">Returning customers</p>
            <p className="mt-2 text-3xl font-semibold text-primary">18%</p>
          </div>
        </div>
      </div>
    </ShopShell>
  );
}
