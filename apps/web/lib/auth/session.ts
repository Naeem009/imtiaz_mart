import { cookies } from "next/headers";
import type { AuthUser } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { AUTH_COOKIES } from "./cookies";

export async function getSession(): Promise<AuthUser | null> {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIES.accessToken)?.value;
  if (!accessToken) return null;

  const res = await fetch(`${siteConfig.apiUrl}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json() as Promise<AuthUser>;
}
