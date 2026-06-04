import type { CustomerAddressDto } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

async function authFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(`${siteConfig.apiUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...init?.headers,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function fetchAddresses(): Promise<CustomerAddressDto[]> {
  return (await authFetch<CustomerAddressDto[]>("/customer/addresses")) ?? [];
}

export async function createAddressApi(
  body: Omit<CustomerAddressDto, "id" | "isDefault"> & { isDefault?: boolean },
): Promise<CustomerAddressDto | null> {
  return authFetch<CustomerAddressDto>("/customer/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteAddressApi(id: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) return false;
  const res = await fetch(`${siteConfig.apiUrl}/customer/addresses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
