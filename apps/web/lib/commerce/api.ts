import type {
  AffiliateDto,
  BannerDto,
  BlogPostDto,
  CmsPageDto,
  FaqDto,
  PaymentDto,
  ReturnRequestDto,
  ReviewDto,
  RewardAccountDto,
  WishlistItemDto,
} from "@imtiaz-mart/shared";
import { siteConfig } from "@/config/site";
import { authFetchJson, authMutateJson } from "@/lib/api/auth-fetch";

export async function fetchCmsPage(slug: string) {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/pages/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return res.json() as Promise<CmsPageDto>;
  } catch {
    return null;
  }
}

export async function fetchFaqs() {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/faqs`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return res.json() as Promise<FaqDto[]>;
  } catch {
    return [];
  }
}

export async function fetchBlogs() {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/blogs`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return res.json() as Promise<BlogPostDto[]>;
  } catch {
    return [];
  }
}

export async function fetchBlog(slug: string) {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/blogs/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    return res.json() as Promise<BlogPostDto>;
  } catch {
    return null;
  }
}

export async function fetchBanners(placement = "home") {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/banners?placement=${placement}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json() as Promise<BannerDto[]>;
  } catch {
    return [];
  }
}

export async function fetchProductReviews(slug: string) {
  try {
    const res = await fetch(`${siteConfig.apiUrl}/products/${slug}/reviews`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return res.json() as Promise<ReviewDto[]>;
  } catch {
    return [];
  }
}

export async function fetchWishlist() {
  return (await authFetchJson<WishlistItemDto[]>("/customer/wishlist")) ?? [];
}

export async function fetchMyReviews() {
  return (await authFetchJson<ReviewDto[]>("/customer/reviews")) ?? [];
}

export async function fetchRewards() {
  return authFetchJson<RewardAccountDto>("/customer/rewards");
}

export async function fetchAffiliate() {
  return authFetchJson<AffiliateDto>("/affiliate/me");
}

export async function fetchMyReturns() {
  return (await authFetchJson<ReturnRequestDto[]>("/orders/return")) ?? [];
}

export async function fetchAdminPayments() {
  return (await authFetchJson<PaymentDto[]>("/admin/payments")) ?? [];
}

export async function fetchAdminReturns() {
  return (await authFetchJson<ReturnRequestDto[]>("/admin/returns")) ?? [];
}

export async function fetchAdminCmsPages() {
  return (await authFetchJson<CmsPageDto[]>("/admin/cms/pages")) ?? [];
}

export async function addWishlistApi(productId: string) {
  return authMutateJson("/customer/wishlist", {
    method: "POST",
    body: JSON.stringify({ productId }),
  });
}

export async function removeWishlistApi(productId: string) {
  return authMutateJson(`/customer/wishlist/${productId}`, { method: "DELETE" });
}

export async function createReviewApi(body: {
  productId: string;
  rating: number;
  title?: string;
  body: string;
}) {
  return authMutateJson("/customer/reviews", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function createReturnApi(body: {
  orderNumber: string;
  itemIds: string[];
  reason: string;
}) {
  return authMutateJson("/orders/return", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function registerAffiliateApi() {
  return authMutateJson("/affiliate/register", { method: "POST" });
}
