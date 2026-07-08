import { logoutAction } from "@/lib/auth/actions";
import { AccountShell } from "@/components/layout/account-shell";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await getSession();
  if (!user) redirect("/login?redirect=/account");

  return (
    <AccountShell active="/account" title="My account">
      <div className="rounded-xl border border-border bg-surface p-8">
        <dl className="space-y-4">
          <div>
            <dt className="text-sm text-muted">Email</dt>
            <dd className="font-medium text-primary">{user.email}</dd>
          </div>
          {(user.firstName || user.lastName) && (
            <div>
              <dt className="text-sm text-muted">Name</dt>
              <dd className="font-medium text-primary">
                {[user.firstName, user.lastName].filter(Boolean).join(" ")}
              </dd>
            </div>
          )}
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {(user.roles ?? []).some((role) => role === "admin" || role === "super_admin") && (
            <a href="/admin" className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white hover:opacity-90">
              Open admin panel
            </a>
          )}
          {(user.roles ?? []).some((role) => role === "vendor" || role === "vendor_staff") && (
            <a href="/vendor" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-primary hover:bg-background">
              Open vendor dashboard
            </a>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-primary hover:bg-background"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </AccountShell>
  );
}
