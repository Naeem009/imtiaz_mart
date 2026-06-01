import type { CartDto, OrderDto } from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { AUTH_COOKIES } from "@/lib/auth/cookies";
import { cookies } from "next/headers";
import { ensureCartSession } from "./session";

async function cartHeaders(): Promise<HeadersInit> {
  const store = await cookies();
  const sessionId = await ensureCartSession();
  const accessToken = store.get(AUTH_COOKIES.accessToken)?.value;

  return {
    "Content-Type": "application/json",
    "X-Cart-Session": sessionId,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

export async function fetchCart(): Promise<CartDto | null> {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/cart`, {
      headers: await cartHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function addToCartApi(
  variantId: string,
  quantity: number,
): Promise<CartDto | null> {
  const res = await fetch(`${siteConfig.apiUrl}/cart/items`, {
    method: "POST",
    headers: await cartHeaders(),
    body: JSON.stringify({ variantId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string[] }).message?.[0] ?? "Could not add to cart",
    );
  }
  return res.json();
}

export async function updateCartItemApi(
  itemId: string,
  quantity: number,
): Promise<CartDto | null> {
  const res = await fetch(`${siteConfig.apiUrl}/cart/items/${itemId}`, {
    method: "PATCH",
    headers: await cartHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function removeCartItemApi(itemId: string): Promise<CartDto | null> {
  const res = await fetch(`${siteConfig.apiUrl}/cart/items/${itemId}`, {
    method: "DELETE",
    headers: await cartHeaders(),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createOrderApi(body: {
  shippingName: string;
  shippingPhone?: string;
  shippingLine1: string;
  shippingLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostal: string;
  shippingCountry?: string;
  paymentMethod: "cod" | "card";
}): Promise<OrderDto> {
  const res = await fetch(`${siteConfig.apiUrl}/orders/create`, {
    method: "POST",
    headers: await cartHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string[] }).message?.[0] ?? "Checkout failed",
    );
  }
  return res.json();
}

export async function fetchOrder(orderNumber: string): Promise<OrderDto | null> {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIES.accessToken)?.value;
  if (!accessToken) return null;

  const res = await fetch(
    `${siteConfig.apiUrl}/orders/track/${orderNumber}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  return res.json();
}

export async function fetchMyOrders(): Promise<OrderDto[]> {
  const store = await cookies();
  const accessToken = store.get(AUTH_COOKIES.accessToken)?.value;
  if (!accessToken) return [];

  const res = await fetch(`${siteConfig.apiUrl}/orders`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json();
}
