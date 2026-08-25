import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { forgotPasswordAction } from "@/lib/auth/password-actions";

export const metadata = { title: "Forgot password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; resetUrl?: string }>;
}) {
  const { error, sent, resetUrl } = await searchParams;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <SiteLogo variant="auth" priority />
          <h1 className="mt-6 text-2xl font-bold text-primary">Forgot password</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send a reset link if an account exists.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          {sent ? (
            <div className="space-y-4 text-sm">
              <p className="rounded-lg bg-success/10 px-4 py-3 text-success" role="status">
                If that email is registered, you will receive reset instructions.
              </p>
              {resetUrl ? (
                <p className="text-muted">
                  Local development link:{" "}
                  <Link href={resetUrl} className="break-all font-medium text-accent hover:underline">
                    {resetUrl}
                  </Link>
                </p>
              ) : (
                <p className="text-muted">Check the API server log for the reset URL when email is not configured.</p>
              )}
              <p>
                <Link href="/login" className="font-medium text-accent hover:underline">
                  Back to sign in
                </Link>
              </p>
            </div>
          ) : (
            <form action={forgotPasswordAction} className="space-y-4">
              {error ? (
                <p className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {decodeURIComponent(error)}
                </p>
              ) : null}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-primary">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-cta py-3 text-sm font-semibold text-white hover:opacity-90"
              >
                Send reset link
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-medium text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
