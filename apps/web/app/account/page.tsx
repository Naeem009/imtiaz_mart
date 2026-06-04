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
        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-primary hover:bg-background"
          >
            Sign out
          </button>
        </form>
      </div>
    </AccountShell>
  );
}
