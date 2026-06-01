import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { getSession } from "@/lib/auth/session";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "My account",
};

export default async function AccountPage() {
  const user = await getSession();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm text-muted hover:text-text">
        &larr; Back to store
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-primary">My account</h1>
      <div className="mt-8 rounded-xl border border-border bg-surface p-8">
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
          <div>
            <dt className="text-sm text-muted">Roles</dt>
            <dd className="flex flex-wrap gap-2">
              {user.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {role}
                </span>
              ))}
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/account/orders"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-primary hover:bg-surface"
          >
            My orders
          </Link>
        </div>

        <form action={logoutAction} className="mt-8">
          <button
            type="submit"
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-background"
          >
            Sign out
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        {siteConfig.name} customer portal
      </p>
    </div>
  );
}
