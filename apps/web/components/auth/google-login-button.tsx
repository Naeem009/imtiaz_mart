import { isGoogleOAuthConfigured, safeAuthPath } from "@/lib/auth/google";

interface GoogleLoginButtonProps {
  redirect?: string;
  errorPath?: string;
}

export function GoogleLoginButton({
  redirect = "/account",
  errorPath = "/login",
}: GoogleLoginButtonProps) {
  const redirectTo = safeAuthPath(redirect);
  const href = `/auth/google?redirect=${encodeURIComponent(redirectTo)}&errorPath=${encodeURIComponent(safeAuthPath(errorPath, "/login"))}`;

  return (
    <div className="space-y-2">
      <a
        href={href}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-sm transition-colors hover:bg-surface"
      >
        <GoogleMark />
        Continue with Google
      </a>
      {!isGoogleOAuthConfigured() && process.env.NODE_ENV !== "production" ? (
        <p className="text-center text-xs text-muted">
          Add Google OAuth client ID and secret to enable this button.
        </p>
      ) : null}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13.2 24 13.2c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35.3 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.8-6.6 7.4l6.3 5.2C38.9 37.8 44 31.6 44 24c0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
