import { cookies } from "next/headers";
import { v7 as uuidv7 } from "uuid";

export const CART_SESSION_COOKIE = "imtiaz_cart_session";

export async function ensureCartSession(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_SESSION_COOKIE)?.value;
  if (existing) return existing;

  const sessionId = uuidv7();
  store.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return sessionId;
}

export async function getCartSession(): Promise<string | undefined> {
  return (await cookies()).get(CART_SESSION_COOKIE)?.value;
}
