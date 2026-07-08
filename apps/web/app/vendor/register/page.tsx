import Link from "next/link";
import { redirect } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth/session";
import { registerVendorAction } from "@/lib/vendor/actions";

export const metadata = { title: "Become a vendor" };

export default async function VendorRegisterPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/vendor/register");

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 rounded-2xl border border-border bg-surface p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Vendor onboarding
          </p>
          <h1 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">
            Sell your products with {siteConfig.name}
          </h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Launch your marketplace store, manage your inventory, and grow with a
            premium commerce experience built for modern sellers.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-primary">
            <li>• Dedicated vendor store profile</li>
            <li>• Product and order management</li>
            <li>• Commission-ready storefront experience</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-background p-6">
          <form action={registerVendorAction} className="space-y-4">
            <div>
              <label htmlFor="storeName" className="mb-1.5 block text-sm font-medium text-primary">
                Store name
              </label>
              <input
                id="storeName"
                name="storeName"
                required
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-primary">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Create vendor account
            </button>
          </form>
          <p className="mt-4 text-sm text-muted">
            Already have a store? <Link href="/account" className="text-accent hover:underline">Open your dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
