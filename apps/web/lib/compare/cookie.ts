import { cookies } from "next/headers";

export const COMPARE_COOKIE = "atvoo_compare";
export const MAX_COMPARE = 4;

function parseIds(value: string | undefined): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((id) => id.trim()).filter(Boolean))];
}

export async function getCompareIds(): Promise<string[]> {
  const store = await cookies();
  return parseIds(store.get(COMPARE_COOKIE)?.value).slice(0, MAX_COMPARE);
}

export async function setCompareIds(ids: string[]) {
  const store = await cookies();
  const next = [...new Set(ids)].slice(0, MAX_COMPARE);
  if (next.length === 0) {
    store.delete(COMPARE_COOKIE);
    return;
  }
  store.set(COMPARE_COOKIE, next.join(","), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
