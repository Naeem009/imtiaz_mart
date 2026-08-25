export function safeAuthPath(path: string | null | undefined, fallback = "/account"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_CLIENT_PLACEHOLDER = "your-google-client-id";

export function googleOAuthRedirectUri(origin: string): string {
  return `${origin.replace(/\/$/, "")}/auth/google/callback`;
}

export function googleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID ??
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ??
    ""
  ).trim();
}

export function isGoogleOAuthConfigured(): boolean {
  const clientId = googleClientId();
  return Boolean(clientId) && clientId !== GOOGLE_CLIENT_PLACEHOLDER;
}
