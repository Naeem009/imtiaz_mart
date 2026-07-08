import Link from "next/link";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { registerAction } from "@/lib/auth/actions";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Create account",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold text-primary">
            {siteConfig.name}
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-primary">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Join {siteConfig.name} and start shopping
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <form action={registerAction} className="space-y-4">
            {error && (
              <p
                className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {decodeURIComponent(error)}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" name="firstName" autoComplete="given-name" />
              <Field label="Last name" name="lastName" autoComplete="family-name" />
            </div>
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-cta py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create account
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-5">
            <GoogleLoginButton redirect="/account" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-primary">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
