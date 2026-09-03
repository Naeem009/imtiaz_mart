import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { AFFILIATE_COOKIE } from "@/lib/commerce/affiliate";
import { AUTH_COOKIES, cookieOptions } from "@/lib/auth/cookies";

type AuthTokens = { accessToken: string; refreshToken: string };

function tokenExpiresSoon(token: string): boolean {
  try {
    const [, encodedPayload] = token.split(".");
    if (!encodedPayload) return true;
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as {
      exp?: number;
    };
    return !payload.exp || payload.exp <= Math.floor(Date.now() / 1000) + 30;
  } catch {
    return true;
  }
}

async function refreshAuth(request: NextRequest, response: NextResponse) {
  const accessToken = request.cookies.get(AUTH_COOKIES.accessToken)?.value;
  const refreshToken = request.cookies.get(AUTH_COOKIES.refreshToken)?.value;
  if (!refreshToken || (accessToken && !tokenExpiresSoon(accessToken))) {
    return;
  }

  try {
    const refreshResponse = await fetch(`${siteConfig.apiUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!refreshResponse.ok) {
      if (refreshResponse.status === 401 || refreshResponse.status === 403) {
        response.cookies.delete(AUTH_COOKIES.accessToken);
        response.cookies.delete(AUTH_COOKIES.refreshToken);
      }
      return;
    }

    const tokens = (await refreshResponse.json()) as AuthTokens;
    response.cookies.set(AUTH_COOKIES.accessToken, tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60,
    });
    response.cookies.set(AUTH_COOKIES.refreshToken, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch {}
}

export async function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  const response = NextResponse.next();
  if (ref) {
    response.cookies.set(AFFILIATE_COOKIE, ref.trim().toUpperCase(), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  await refreshAuth(request, response);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.png|uploads).*)"],
};
