import { siteConfig } from "@/config/site";
import { getAccessToken } from "@/lib/auth/session";

async function authFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
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

export async function registerVendorApi(body: { storeName: string; description?: string }) {
  return authFetch<{ id: string; name: string; slug: string }>('/vendor/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function fetchVendorStore(slug: string) {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/vendors/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      logoUrl: string | null;
      rating: number;
      isVerified: boolean;
      productCount: number;
      products?: Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        compareAtPrice: number | null;
        shortDescription: string | null;
        rating: number;
        reviewCount: number;
        badge: string | null;
        category: { id?: string; name: string; slug: string };
        vendor: { id?: string; name: string; slug: string; rating: number };
        images: Array<{ id: string; url: string; alt: string | null; isPrimary: boolean }>;
      }>;
    };

    return {
      ...data,
      products: (data.products ?? []).map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        rating: product.rating,
        reviewCount: product.reviewCount,
        badge: product.badge,
        primaryImage: product.images.find((img) => img.isPrimary)?.url ?? product.images[0]?.url ?? null,
        vendor: {
          id: product.vendor.id ?? product.vendor.slug,
          name: product.vendor.name,
          slug: product.vendor.slug,
          rating: product.vendor.rating,
        },
        category: {
          id: product.category.id ?? product.category.slug,
          name: product.category.name,
          slug: product.category.slug,
        },
        brand: null,
      })),
    };
  } catch {
    return null;
  }
}
