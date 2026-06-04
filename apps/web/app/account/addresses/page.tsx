import { AccountShell } from "@/components/layout/account-shell";
import { createAddressAction, deleteAddressAction } from "@/lib/customer/actions";
import { fetchAddresses } from "@/lib/customer/api";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = { title: "Addresses" };

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account/addresses");

  const { error } = await searchParams;
  const addresses = await fetchAddresses();

  return (
    <AccountShell active="/account/addresses" title="Saved addresses">
      {error && (
        <p className="mb-4 rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
          {decodeURIComponent(error)}
        </p>
      )}

      {addresses.length > 0 && (
        <ul className="space-y-4">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-primary">
                    {addr.label}
                    {addr.isDefault && (
                      <span className="ml-2 rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {addr.line1}
                    {addr.line2 && (
                      <>
                        <br />
                        {addr.line2}
                      </>
                    )}
                    <br />
                    {addr.city}
                    {addr.state && `, ${addr.state}`} {addr.postalCode}
                    <br />
                    {addr.country}
                    {addr.phone && (
                      <>
                        <br />
                        {addr.phone}
                      </>
                    )}
                  </p>
                </div>
                <form action={deleteAddressAction}>
                  <input type="hidden" name="id" value={addr.id} />
                  <button
                    type="submit"
                    className="text-sm text-error hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-primary">Add new address</h2>
        <form action={createAddressAction} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="label">
                Label
              </label>
              <input
                id="label"
                name="label"
                defaultValue="Home"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="line1">
              Address line 1
            </label>
            <input
              id="line1"
              name="line1"
              required
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="line2">
              Address line 2
            </label>
            <input
              id="line2"
              name="line2"
              className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="city">
                City
              </label>
              <input
                id="city"
                name="city"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="postalCode">
                Postal code
              </label>
              <input
                id="postalCode"
                name="postalCode"
                required
                className="w-full rounded-lg border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <input type="hidden" name="country" value="PK" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" className="rounded" />
            Set as default address
          </label>
          <button
            type="submit"
            className="rounded-lg bg-cta px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Save address
          </button>
        </form>
      </div>
    </AccountShell>
  );
}
