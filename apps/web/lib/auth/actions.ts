"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthResponse } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { AUTH_COOKIES, cookieOptions } from "./cookies";

async function setAuthCookies(data: AuthResponse) {
  const store = await cookies();
  const refreshMaxAge = 7 * 24 * 60 * 60;

  store.set(AUTH_COOKIES.accessToken, data.accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60,
  });
  store.set(AUTH_COOKIES.refreshToken, data.refreshToken, {
    ...cookieOptions,
    maxAge: refreshMaxAge,
  });
}

async function clearAuthCookies() {
  const store = await cookies();
  store.delete(AUTH_COOKIES.accessToken);
  store.delete(AUTH_COOKIES.refreshToken);
}

function safeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/account";
  }
  return path;
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = safeRedirect(formData.get("redirect") as string | null);

  const res = await fetch(`${siteConfig.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { message?: string[] }).message?.[0] ??
      "Invalid email or password";
    redirect(
      `/login?error=${encodeURIComponent(message)}&redirect=${encodeURIComponent(redirectTo)}`,
    );
  }

  const data = (await res.json()) as AuthResponse;
  await setAuthCookies(data);
  redirect(redirectTo);
}

export async function registerAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = (formData.get("firstName") as string) || undefined;
  const lastName = (formData.get("lastName") as string) || undefined;

  const res = await fetch(`${siteConfig.apiUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, firstName, lastName }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      (err as { message?: string[] }).message?.[0] ?? "Registration failed";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  const data = (await res.json()) as AuthResponse;
  await setAuthCookies(data);
  redirect("/account");
}

export async function logoutAction() {
  const store = await cookies();
  const refreshToken = store.get(AUTH_COOKIES.refreshToken)?.value;

  if (refreshToken) {
    await fetch(`${siteConfig.apiUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  await clearAuthCookies();
  redirect("/");
}
