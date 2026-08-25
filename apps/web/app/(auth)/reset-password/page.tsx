import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { resetPasswordAction } from "@/lib/auth/password-actions";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <SiteLogo variant="auth" priority />
          <h1 className="mt-6 text-2xl font-bold text-primary">Set a new password</h1>
          <p className="mt-2 text-sm text-muted">Choose a password with at least 8 characters.</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          {!token ? (
            <p className="text-sm text-muted">
              This reset link is missing a token. Request a new one from{" "}
              <Link href="/forgot-password" className="font-medium text-accent hover:underline">
                forgot password
              </Link>
              .
            </p>
          ) : (
            <form action={resetPasswordAction} className="space-y-4">
              <input type="hidden" name="token" value={token} />
              {error ? (
                <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {decodeURIComponent(error)}
                </p>
              ) : null}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-primary">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-primary">
                  Confirm password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-cta py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Update password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
