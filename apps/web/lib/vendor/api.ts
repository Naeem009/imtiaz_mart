import type {
  PaginatedResponse,
  ProductListItem,
  PublicVendorDto,
  SocialAccountDto,
  SocialAnalyticsDto,
  SocialQueueItemDto,
  SocialRuleDto,
  VendorAnalyticsDto,
  VendorOrderDto,
  VendorProductDto,
  VendorInventoryDto,
  VendorPayoutDto,
  VendorProfileDto,
} from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { authFetchJson } from "@/lib/api/auth-fetch";

export async function fetchVendorProfile() {
  return authFetchJson<VendorProfileDto>("/vendor/profile");
}

export async function fetchVendorProducts() {
  return authFetchJson<VendorProductDto[]>("/vendor/products");
}

export async function fetchVendorInventory() {
  return authFetchJson<{ warehouses: Array<{ id: string; name: string; city: string | null; country: string }>; items: VendorInventoryDto[] }>("/vendor/inventory");
}

export async function fetchVendorOrders(page = 1) {
  return authFetchJson<PaginatedResponse<VendorOrderDto>>(`/vendor/orders?page=${page}`);
}

export async function fetchVendorAnalytics() {
  return authFetchJson<VendorAnalyticsDto>("/vendor/analytics");
}

export async function fetchVendorPayouts() {
  return (await authFetchJson<VendorPayoutDto[]>("/vendor/payouts")) ?? [];
}

export async function fetchSocialAccounts() {
  return authFetchJson<SocialAccountDto[]>("/vendor/social-accounts");
}

export async function fetchSocialRules() {
  return authFetchJson<SocialRuleDto[]>("/vendor/social-automation/rules");
}

export async function fetchSocialQueue() {
  return authFetchJson<SocialQueueItemDto[]>("/vendor/social-automation/queue");
}

export async function fetchSocialAnalytics() {
  return authFetchJson<SocialAnalyticsDto>("/vendor/social-automation/analytics");
}

export async function fetchPublicVendors(): Promise<PublicVendorDto[]> {
  try {
    const response = await fetch(`${siteConfig.apiUrl}/vendors`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    return response.json() as Promise<PublicVendorDto[]>;
  } catch {
    return [];
  }
}

export async function fetchVendorStore(slug: string) {
  try {
    const response = await fetch(`${siteConfig.apiUrl}/vendors/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    return response.json() as Promise<
      PublicVendorDto & { products: ProductListItem[] }
    >;
  } catch {
    return null;
  }
}
