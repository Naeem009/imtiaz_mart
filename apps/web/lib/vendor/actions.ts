"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authMutateJson } from "@/lib/api/auth-fetch";

function fail(path: string, error: string): never {
  redirect(`${path}?error=${encodeURIComponent(error)}`);
}

export async function registerVendorAction(formData: FormData) {
  const result = await authMutateJson<{ id: string; name: string; slug: string }>(
    "/vendor/register",
    {
      method: "POST",
      body: JSON.stringify({
        storeName: formData.get("storeName"),
        description: (formData.get("description") as string) || undefined,
      }),
    },
  );

  if ("error" in result) {
    fail("/vendor/register", result.error);
  }

  revalidatePath("/account");
  redirect("/vendor");
}

export async function createVendorProductAction(formData: FormData) {
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock") || 50);
  const compareAt = formData.get("compareAtPrice");

  const result = await authMutateJson("/vendor/products", {
    method: "POST",
    body: JSON.stringify({
      name: String(formData.get("name") ?? "").trim(),
      categoryId: String(formData.get("categoryId") ?? ""),
      price,
      compareAtPrice: compareAt ? Number(compareAt) : undefined,
      shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
      stock: Number.isFinite(stock) ? stock : 50,
      status: String(formData.get("status") ?? "DRAFT"),
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
      isEligibleSearch: formData.get("isEligibleSearch") === "on",
      isEligibleCheckout: formData.get("isEligibleCheckout") === "on",
    }),
  });

  if ("error" in result) {
    fail("/vendor/products", result.error);
  }

  revalidatePath("/vendor/products");
  redirect("/vendor/products");
}

export async function archiveVendorProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/vendor/products/${id}`, {
    method: "DELETE",
  });

  if ("error" in result) {
    fail("/vendor/products", result.error);
  }

  revalidatePath("/vendor/products");
  redirect("/vendor/products");
}

export async function updateVendorProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const compareAt = formData.get("compareAtPrice");

  const result = await authMutateJson(`/vendor/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      name: String(formData.get("name") ?? "").trim(),
      price,
      compareAtPrice: compareAt ? Number(compareAt) : undefined,
      shortDescription: String(formData.get("shortDescription") ?? "").trim() || undefined,
      description: String(formData.get("description") ?? "").trim() || undefined,
      categoryId: String(formData.get("categoryId") ?? "").trim() || undefined,
      imageUrl: String(formData.get("imageUrl") ?? "").trim() || undefined,
      stock,
      status: String(formData.get("status") ?? "DRAFT"),
      isEligibleSearch: formData.get("isEligibleSearch") === "on",
      isEligibleCheckout: formData.get("isEligibleCheckout") === "on",
    }),
  });

  if ("error" in result) {
    fail(`/vendor/products/${id}/edit`, result.error);
  }

  revalidatePath("/vendor/products");
  redirect("/vendor/products");
}

export async function connectSocialAccountAction(formData: FormData) {
  const result = await authMutateJson("/vendor/social-accounts/connect", {
    method: "POST",
    body: JSON.stringify({
      provider: String(formData.get("provider") ?? "").trim().toLowerCase(),
      providerAccountId: String(formData.get("providerAccountId") ?? "").trim(),
      scopes: ["publish"],
    }),
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  revalidatePath("/vendor/social-automation");
  redirect("/vendor/social-automation");
}

export async function createSocialRuleAction(formData: FormData) {
  const result = await authMutateJson("/vendor/social-automation/rules", {
    method: "POST",
    body: JSON.stringify({
      name: String(formData.get("name") ?? "").trim(),
      triggers: ["Manual"],
      platforms: ["facebook", "instagram", "tiktok"],
      config: { autoPublish: false, maxPerDay: 12 },
    }),
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  revalidatePath("/vendor/social-automation");
  redirect("/vendor/social-automation");
}

export async function triggerSocialRuleAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/vendor/social-automation/rules/${id}/trigger`, {
    method: "POST",
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  revalidatePath("/vendor/social-automation");
  redirect("/vendor/social-automation");
}

export async function approveSocialQueueAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/vendor/social-automation/queue/${id}/approve`, {
    method: "POST",
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  revalidatePath("/vendor/social-automation");
  redirect("/vendor/social-automation");
}

export async function rejectSocialQueueAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const result = await authMutateJson(`/vendor/social-automation/queue/${id}/reject`, {
    method: "POST",
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  revalidatePath("/vendor/social-automation");
  redirect("/vendor/social-automation");
}

export async function generateSocialPostAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "").trim();
  const result = await authMutateJson<{
    caption: string;
    hashtags: string[];
    productId: string | null;
  }>("/vendor/social-automation/generate-post", {
    method: "POST",
    body: JSON.stringify(productId ? { productId } : {}),
  });

  if ("error" in result) {
    fail("/vendor/social-automation", result.error);
  }

  redirect(
    `/vendor/social-automation?draft=${encodeURIComponent(result.data.caption)}`,
  );
}
