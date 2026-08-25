import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  googleClientId,
  googleOAuthRedirectUri,
  isGoogleOAuthConfigured,
  safeAuthPath,
} from "@/lib/auth/google";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = safeAuthPath(url.searchParams.get("redirect"));
  const errorPath = safeAuthPath(url.searchParams.get("errorPath"), "/login");

  if (!isGoogleOAuthConfigured()) {
    const target = new URL(errorPath, siteConfig.url);
    target.searchParams.set("error", "Google sign-in is not configured yet.");
    target.searchParams.set("redirect", redirectTo);
    return NextResponse.redirect(target);
  }

  const state = randomBytes(24).toString("hex");
  const origin = siteConfig.url.replace(/\/$/, "");
  const redirectUri = googleOAuthRedirectUri(origin);

  const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleUrl.searchParams.set("client_id", googleClientId());
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("state", state);
  googleUrl.searchParams.set("access_type", "online");
  googleUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(googleUrl);
  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    Buffer.from(JSON.stringify({ state, redirectTo, errorPath })).toString("base64url"),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    },
  );
  return response;
}
