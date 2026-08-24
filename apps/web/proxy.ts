import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AFFILIATE_COOKIE } from "@/lib/commerce/affiliate";

export function proxy(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(AFFILIATE_COOKIE, ref.trim().toUpperCase(), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.png|uploads).*)"],
};
