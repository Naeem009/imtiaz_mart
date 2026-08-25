import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { AuthResponse } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { AUTH_COOKIES, cookieOptions } from "@/lib/auth/cookies";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  googleOAuthRedirectUri,
  safeAuthPath,
} from "@/lib/auth/google";

type OAuthState = {
  state: string;
  redirectTo: string;
  errorPath: string;
};

function fail(errorPath: string, redirectTo: string, message: string) {
  const target = new URL(errorPath, siteConfig.url);
  target.searchParams.set("error", message);
  target.searchParams.set("redirect", redirectTo);
  const response = NextResponse.redirect(target);
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

function apiErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return "Google sign-in failed";
  }
  const message = (payload as { message?: string | string[] }).message;
  if (Array.isArray(message) && message[0]) return String(message[0]);
  if (typeof message === "string" && message) return message;
  return "Google sign-in failed";
}

function readState(raw: string | undefined): OAuthState | null {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as OAuthState;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = siteConfig.url.replace(/\/$/, "");
  const redirectUri = googleOAuthRedirectUri(origin);
  const store = await cookies();
  const stored = readState(store.get(GOOGLE_OAUTH_STATE_COOKIE)?.value);
  const errorPath = safeAuthPath(stored?.errorPath, "/login");
  const redirectTo = safeAuthPath(stored?.redirectTo);

  if (url.searchParams.get("error")) {
    return fail(errorPath, redirectTo, "Google sign-in was cancelled.");
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || !stored || stored.state !== state) {
    return fail(errorPath, redirectTo, "Google sign-in could not be verified. Please try again.");
  }

  const res = await fetch(`${siteConfig.apiUrl}/auth/google/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, redirectUri }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return fail(errorPath, redirectTo, apiErrorMessage(err));
  }

  const data = (await res.json()) as AuthResponse;
  const response = NextResponse.redirect(new URL(redirectTo, origin));
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  response.cookies.set(AUTH_COOKIES.accessToken, data.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  response.cookies.set(AUTH_COOKIES.refreshToken, data.refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
