import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

async function parseError(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const json = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(json.message)) return json.message.join(", ");
    if (typeof json.message === "string") return json.message;
  } catch {
    // ignore non-JSON error bodies
  }
  return text || `Request failed (${response.status})`;
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export async function authFetchJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch(`${siteConfig.apiUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return parseJson<T>(response);
  } catch {
    return null;
  }
}

export async function authMutateJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T } | { error: string }> {
  const token = await getAccessToken();
  if (!token) return { error: "You need to sign in again." };

  try {
    const response = await fetch(`${siteConfig.apiUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { error: await parseError(response) };
    }

    return { data: await parseJson<T>(response) };
  } catch {
    return { error: "Could not reach the API. Please try again." };
  }
}
