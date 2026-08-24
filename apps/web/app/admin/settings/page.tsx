import { ShopShell } from "@/components/layout/shop-shell";
import { PortalNav, adminNav } from "@/components/layout/portal-nav";
import { ADMIN_ROLES, requireRoles } from "@/lib/auth/require-roles";
import { updatePlatformSettingsAction } from "@/lib/admin/actions";
import { fetchAdminSettings } from "@/lib/admin/api";
import type { PlatformSettingsDto } from "@imtiaz-mart/shared";

export const metadata = { title: "Admin settings" };

const FALLBACK: PlatformSettingsDto = {
  storeName: "ATVOO",
  supportEmail: "support@example.com",
  freeShippingThreshold: 2999,
  shippingFee: 250,
  platformFeeRate: 0.1,
  announcementText: "Free shipping on orders over Rs. 2,999",
  announcementHref: "/deals",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRoles(ADMIN_ROLES, "/admin/settings");
  const { error } = await searchParams;
  const settings = (await fetchAdminSettings()) ?? FALLBACK;

  return (
    <ShopShell>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Admin panel</p>
          <h1 className="mt-2 text-3xl font-bold text-primary">Settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
            Store identity, shipping thresholds, platform fee, and the homepage announcement.
          </p>
          <PortalNav current="/admin/settings" links={adminNav} />
        </div>

        {error ? (
          <p className="mt-6 rounded-xl bg-error/10 px-4 py-3 text-sm text-error">
            {decodeURIComponent(error)}
          </p>
        ) : null}

        <form
          action={updatePlatformSettingsAction}
          className="mt-8 max-w-2xl space-y-4 rounded-2xl border border-border bg-surface p-6"
        >
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-primary">Store name</span>
            <input
              name="storeName"
              defaultValue={settings.storeName}
              required
              minLength={2}
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-primary">Support email</span>
            <input
              name="supportEmail"
              type="email"
              defaultValue={settings.supportEmail}
              required
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-primary">Free shipping over (PKR)</span>
              <input
                name="freeShippingThreshold"
                type="number"
                min={0}
                defaultValue={settings.freeShippingThreshold}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-primary">Shipping fee (PKR)</span>
              <input
                name="shippingFee"
                type="number"
                min={0}
                defaultValue={settings.shippingFee}
                required
                className="w-full rounded-lg border border-border px-4 py-2.5"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-primary">Platform fee rate (0–1)</span>
            <input
              name="platformFeeRate"
              type="number"
              min={0}
              max={1}
              step="0.01"
              defaultValue={settings.platformFeeRate}
              required
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-primary">Announcement text</span>
            <input
              name="announcementText"
              defaultValue={settings.announcementText}
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-primary">Announcement link</span>
            <input
              name="announcementHref"
              defaultValue={settings.announcementHref}
              className="w-full rounded-lg border border-border px-4 py-2.5"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Save settings
          </button>
        </form>
      </div>
    </ShopShell>
  );
}
