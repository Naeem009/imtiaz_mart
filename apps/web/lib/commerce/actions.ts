"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addWishlistApi,
  createReturnApi,
  createReviewApi,
  registerAffiliateApi,
  removeWishlistApi,
} from "./api";

export async function addToWishlistAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const result = await addWishlistApi(productId);
  if ("error" in result) {
    redirect(`/login?redirect=${encodeURIComponent(slug ? `/products/${slug}` : "/account/wishlist")}`);
  }
  revalidatePath("/account/wishlist");
  if (slug) revalidatePath(`/products/${slug}`);
  redirect(slug ? `/products/${slug}` : "/account/wishlist");
}

export async function removeWishlistAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const result = await removeWishlistApi(productId);
  if ("error" in result) {
    redirect(`/account/wishlist?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/account/wishlist");
  redirect("/account/wishlist");
}

export async function createReviewAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const result = await createReviewApi({
    productId,
    rating: Number(formData.get("rating") ?? 5),
    title: String(formData.get("title") ?? "") || undefined,
    body: String(formData.get("body") ?? ""),
  });
  if ("error" in result) {
    redirect(`/products/${slug}?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath(`/products/${slug}`);
  redirect(`/products/${slug}`);
}

export async function createReturnAction(formData: FormData) {
  const itemIds = formData.getAll("itemIds").map(String).filter(Boolean);
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const result = await createReturnApi({
    orderNumber,
    itemIds,
    reason: String(formData.get("reason") ?? "Not as described"),
  });
  if ("error" in result) {
    redirect(`/account/returns?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/account/returns");
  redirect("/account/returns");
}

export async function joinAffiliateAction() {
  const result = await registerAffiliateApi();
  if ("error" in result) {
    redirect(`/affiliate?error=${encodeURIComponent(result.error)}`);
  }
  revalidatePath("/affiliate");
  redirect("/affiliate");
}
