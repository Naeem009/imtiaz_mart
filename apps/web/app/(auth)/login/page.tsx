import Link from "next/link";
import { loginAction } from "@/lib/auth/actions";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect: redirectTo } = await searchParams;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-lg font-semibold text-primary">
            {siteConfig.name}
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-primary">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Welcome back to {siteConfig.name}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-8 shadow-sm">
          <form action={loginAction} className="space-y-4">
            {redirectTo && (
              <input type="hidden" name="redirect" value={redirectTo} />
            )}
            {error && (
              <p
                className="rounded-lg bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                {decodeURIComponent(error)}
              </p>
            )}
            <Field label="Email" name="email" type="email" required autoComplete="email" />
            <Field
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-cta py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Sign in
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
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
